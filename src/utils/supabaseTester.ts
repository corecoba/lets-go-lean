import { supabase } from '../lib/supabase';
import { logger } from './logger';

/**
 * Utility for testing Supabase database operations
 * without going through the full registration flow
 */
export const supabaseTester = {
  /**
   * Test RLS policies by attempting to insert, select, update data
   */
  async testRLSPolicies() {
    const testId = `test-${Date.now()}`;
    const results: Record<string, any> = {};
    
    try {
      // 1. Test anonymous insert 
      logger.debug('Testing anonymous insert to users table...');
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([{
          id: testId,
          email: `test-${testId}@example.com`,
          first_name: 'Test',
          last_name: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          goal_type: 'lose_weight',
          current_weight: 70,
          height: 175,
          activity_level: 'moderate',
          target_weight: 65,
          bmr: 1500,
          target_calories: 1200,
          estimated_goal_date: new Date(Date.now() + 86400000 * 30).toISOString(),
          last_ideal_shape: 'never'
        }])
        .select();
      
      results.insert = { success: !insertError, error: insertError?.message };
      
      // 2. Test the RPC function
      logger.debug('Testing RPC function...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('create_user_profile', {
        user_id: testId + '-rpc',
        user_email: `test-${testId}-rpc@example.com`,
        first_name: 'Test RPC',
        last_name: 'User',
        goal_type: 'lose_weight',
        current_weight: 70,
        height: 175,
        activity_level: 'moderate',
        target_weight: 65,
        bmr: 1500,
        target_calories: 1200,
        estimated_goal_date: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
        last_ideal_shape: 'never'
      });
      
      results.rpc = { success: !rpcError, error: rpcError?.message };
      
      // 3. Test select
      logger.debug('Testing select from users table...');
      const { data: selectData, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testId);
      
      results.select = { success: !selectError, data: selectData, error: selectError?.message };
      
      // 4. Test select with RPC id
      logger.debug('Testing select of RPC-created user...');
      const { data: selectRpcData, error: selectRpcError } = await supabase
        .from('users')
        .select('*')
        .eq('id', testId + '-rpc');
      
      results.selectRpc = { success: !selectRpcError, data: selectRpcData, error: selectRpcError?.message };
      
      // Clean up test data (if you have permission)
      try {
        await supabase.from('users').delete().eq('id', testId);
        await supabase.from('users').delete().eq('id', testId + '-rpc');
      } catch (e) {
        logger.debug('Cleanup error (expected with RLS):', e);
      }
      
      return { success: true, results };
    } catch (error) {
      logger.error('Test failed', error);
      return { success: false, error, results };
    }
  },
  
  /**
   * Test Supabase Auth operations
   */
  async testAuth() {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Password123!';
    const results: Record<string, any> = {};
    
    try {
      // 1. Test signup
      logger.debug('Testing signup...');
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      results.signup = { 
        success: !signupError && !!signupData.user, 
        userId: signupData.user?.id,
        error: signupError?.message 
      };
      
      // 2. If signup worked, test signout
      if (results.signup.success) {
        logger.debug('Testing signout...');
        const { error: signoutError } = await supabase.auth.signOut();
        results.signout = { success: !signoutError, error: signoutError?.message };
      }
      
      // 3. Test signin
      logger.debug('Testing signin...');
      const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      results.signin = { 
        success: !signinError && !!signinData.user, 
        userId: signinData.user?.id,
        error: signinError?.message 
      };
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      results.session = { exists: !!session, jwt: session?.access_token ? 'Valid JWT' : 'No JWT' };
      
      // Clean up - sign out again
      await supabase.auth.signOut();
      
      return { success: true, results };
    } catch (error) {
      logger.error('Auth test failed', error);
      return { success: false, error, results };
    }
  },
  
  /**
   * Run all tests
   */
  async runAllTests() {
    logger.debug('Starting Supabase tests...');
    
    const rlsResults = await this.testRLSPolicies();
    const authResults = await this.testAuth();
    
    logger.debug('Tests completed', { rlsResults, authResults });
    
    return {
      rlsResults,
      authResults,
      summary: {
        rls: {
          insert: rlsResults.results.insert?.success ? '✅' : '❌',
          rpc: rlsResults.results.rpc?.success ? '✅' : '❌',
          select: rlsResults.results.select?.success ? '✅' : '❌',
          selectRpc: rlsResults.results.selectRpc?.success ? '✅' : '❌'
        },
        auth: {
          signup: authResults.results.signup?.success ? '✅' : '❌',
          signin: authResults.results.signin?.success ? '✅' : '❌',
          signout: authResults.results.signout?.success ? '✅' : '❌',
          session: authResults.results.session?.exists ? '✅' : '❌'
        }
      }
    };
  }
}; 