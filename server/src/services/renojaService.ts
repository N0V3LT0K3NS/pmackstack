import { pool } from '../config/database';

interface RenojaWeeklyEntry {
  storeCode: string;
  fiscalYear: number;
  weekNumber: number;
  weekEnding: string;
  
  // Weekly Actionables
  digitalPosts: number;
  newGoogleReviews: number;
  totalGoogleReviews: number;
  newPartnerships: number;
  eventsInStudio: number;
  eventsOutsideStudio: number;
  
  // Measured Results
  newMembersSigned: number;
  totalPayingMembers: number;
  membersLost: number;
  avgMemberRate: number;
  
  notes?: string;
}

interface RenojaDashboardSummary {
  totalActiveMembers: number;
  netMemberGrowth: number;
  memberRetentionRate: number;
  avgMemberValue: number;
  digitalEngagement: number;
  eventActivity: number;
  partnershipGrowth: number;
  reviewRating?: number;
  
  // Period comparisons
  memberGrowthTrend: number; // % change
  engagementTrend: number; // % change
  revenueTrend: number; // % change
}

export const renojaService = {
  async getDashboardSummary(
    storeFilter?: string[],
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    
    // Default to last 4 weeks if no date range specified
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let query = `
      SELECT 
        SUM(new_members_signed) as new_members_total,
        SUM(members_lost) as members_lost_total,
        AVG(total_paying_members) as avg_total_members,
        MAX(total_paying_members) as total_paying_members,
        AVG(avg_member_rate) as avg_member_rate,
        SUM(digital_posts) as total_digital_posts,
        SUM(new_google_reviews) as total_google_reviews,
        SUM(new_partnerships) as total_partnerships,
        SUM(events_in_studio + events_outside_studio) as total_events,
        AVG(member_retention_rate) as retention_rate
      FROM renoja_weekly_metrics
      WHERE week_ending BETWEEN $1 AND $2
    `;
    
    const params: any[] = [start, end];
    
    if (storeFilter && storeFilter.length > 0) {
      query += ` AND store_code = ANY($3)`;
      params.push(storeFilter);
    }
    
    const result = await pool.query(query, params);
    const data = result.rows[0];
    
    return {
      newMembersTotal: parseInt(data.new_members_total) || 0,
      totalPayingMembers: parseInt(data.total_paying_members) || 0,
      membersLostTotal: parseInt(data.members_lost_total) || 0,
      avgMemberRate: parseFloat(data.avg_member_rate) || 0,
      retentionRate: parseFloat(data.retention_rate) || 0,
      totalEvents: parseInt(data.total_events) || 0,
      totalDigitalPosts: parseInt(data.total_digital_posts) || 0,
      totalGoogleReviews: parseInt(data.total_google_reviews) || 0,
      totalPartnerships: parseInt(data.total_partnerships) || 0,
    };
  },

  async getTimeSeries(
    storeFilter?: string[],
    startDate?: string,
    endDate?: string,
    groupBy: 'week' | 'month' = 'week'
  ) {
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let query = `
      SELECT 
        week_ending,
        store_code,
        total_paying_members,
        new_members_signed,
        members_lost,
        net_member_change,
        avg_member_rate,
        digital_posts,
        new_google_reviews,
        total_events,
        new_partnerships,
        member_retention_rate as retention_rate,
        (events_in_studio + events_outside_studio) as events,
        new_partnerships as partnerships
      FROM renoja_weekly_metrics
      WHERE week_ending BETWEEN $1 AND $2
    `;
    
    const params: any[] = [start, end];
    
    if (storeFilter && storeFilter.length > 0) {
      query += ` AND store_code = ANY($3)`;
      params.push(storeFilter);
    }
    
    query += ` ORDER BY week_ending, store_code`;
    
    const result = await pool.query(query, params);
    return result.rows;
  },

  async submitWeeklyEntry(entryData: RenojaWeeklyEntry, userId: number) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Check if entry already exists
      const existingCheck = await client.query(
        'SELECT id FROM renoja_weekly_metrics WHERE store_code = $1 AND fiscal_year = $2 AND week_number = $3',
        [entryData.storeCode, entryData.fiscalYear, entryData.weekNumber]
      );

      if (existingCheck.rows.length > 0) {
        throw new Error('Entry for this store and week already exists');
      }

      // Calculate derived fields
      const previousWeekResult = await client.query(
        `SELECT total_paying_members 
         FROM renoja_weekly_metrics 
         WHERE store_code = $1 AND fiscal_year = $2 AND week_number = $3`,
        [entryData.storeCode, entryData.fiscalYear, entryData.weekNumber - 1]
      );
      
      const previousMembers = previousWeekResult.rows[0]?.total_paying_members || entryData.totalPayingMembers;
      const retentionRate = previousMembers > 0 
        ? ((previousMembers - entryData.membersLost) / previousMembers) * 100 
        : 100;

      const previousReviewsResult = await client.query(
        `SELECT total_google_reviews 
         FROM renoja_weekly_metrics 
         WHERE store_code = $1 AND fiscal_year = $2 AND week_number = $3`,
        [entryData.storeCode, entryData.fiscalYear, entryData.weekNumber - 1]
      );
      
      const previousReviews = previousReviewsResult.rows[0]?.total_google_reviews || 
                             (entryData.totalGoogleReviews - entryData.newGoogleReviews);
      const reviewGrowthRate = previousReviews > 0 
        ? ((entryData.newGoogleReviews / previousReviews) * 100)
        : 0;

      // Insert new entry
      const insertResult = await client.query(`
        INSERT INTO renoja_weekly_metrics (
          store_code, fiscal_year, week_number, week_ending,
          digital_posts, new_google_reviews, total_google_reviews, new_partnerships,
          events_in_studio, events_outside_studio,
          new_members_signed, total_paying_members, members_lost, avg_member_rate,
          review_growth_rate, member_retention_rate, notes, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING id, created_at, net_member_change, total_events
      `, [
        entryData.storeCode,
        entryData.fiscalYear,
        entryData.weekNumber,
        entryData.weekEnding,
        entryData.digitalPosts,
        entryData.newGoogleReviews,
        entryData.totalGoogleReviews,
        entryData.newPartnerships,
        entryData.eventsInStudio,
        entryData.eventsOutsideStudio,
        entryData.newMembersSigned,
        entryData.totalPayingMembers,
        entryData.membersLost,
        entryData.avgMemberRate,
        reviewGrowthRate,
        retentionRate,
        entryData.notes,
        userId
      ]);

      await client.query('COMMIT');
      
      return {
        id: insertResult.rows[0].id,
        createdAt: insertResult.rows[0].created_at,
        ...entryData,
        netMemberChange: insertResult.rows[0].net_member_change,
        totalEvents: insertResult.rows[0].total_events,
        memberRetentionRate: retentionRate,
        reviewGrowthRate
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  async getRecentEntries(limit: number = 10, storeFilter?: string[]) {
    let query = `
      SELECT 
        r.*,
        s.store_name,
        u.email as created_by_email
      FROM renoja_weekly_metrics r
      JOIN pos_stores s ON r.store_code = s.store_code
      LEFT JOIN users u ON r.created_by = u.id
    `;
    
    const params: any[] = [];
    
    if (storeFilter && storeFilter.length > 0) {
      query += ` WHERE r.store_code = ANY($1)`;
      params.push(storeFilter);
    }
    
    query += ` ORDER BY r.created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await pool.query(query, params);
    return result.rows;
  },

  async getLastWeekData(storeCode: string) {
    const query = `
      SELECT 
        r.*,
        s.store_name
      FROM renoja_weekly_metrics r
      JOIN pos_stores s ON r.store_code = s.store_code
      WHERE r.store_code = $1
      ORDER BY r.fiscal_year DESC, r.week_number DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [storeCode]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const lastWeek = result.rows[0];
    
    // Calculate the next week ending date
    const currentWeekEnding = new Date(lastWeek.week_ending);
    const nextWeekEnding = new Date(currentWeekEnding);
    nextWeekEnding.setDate(currentWeekEnding.getDate() + 7);

    return {
      lastWeekData: {
        weekEnding: lastWeek.week_ending,
        totalPayingMembers: lastWeek.total_paying_members,
        avgMemberRate: lastWeek.avg_member_rate,
        totalGoogleReviews: lastWeek.total_google_reviews
      },
      nextWeekEnding: nextWeekEnding.toISOString().split('T')[0],
      storeName: lastWeek.store_name
    };
  }
}; 