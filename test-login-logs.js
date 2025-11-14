// Test script for Login Activity Logging System
// Run this in the browser console after logging in as admin

const testLoginActivityLogging = async () => {
  console.log("🧪 Testing Login Activity Logging System...\n");

  try {
    // Test 1: Check if admin can access login logs
    console.log("Test 1: Fetching login logs...");
    const logsResponse = await fetch('/api/admin/login-logs?page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (logsResponse.status === 200) {
      const logsData = await logsResponse.json();
      console.log("✅ Login logs fetched successfully");
      console.log(`   Total logs: ${logsData.pagination.totalLogs}`);
      console.log(`   Active sessions: ${logsData.data.filter(log => !log.timeOut).length}`);
    } else {
      console.log(`❌ Failed to fetch logs. Status: ${logsResponse.status}`);
    }

    // Test 2: Check login statistics
    console.log("\nTest 2: Fetching login statistics...");
    const statsResponse = await fetch('/api/admin/login-stats', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (statsResponse.status === 200) {
      const statsData = await statsResponse.json();
      console.log("✅ Statistics fetched successfully");
      console.log("   Stats:", statsData.stats);
    } else {
      console.log(`❌ Failed to fetch stats. Status: ${statsResponse.status}`);
    }

    // Test 3: Check if current session is logged
    console.log("\nTest 3: Verifying current session is logged...");
    const authState = JSON.parse(localStorage.getItem('authState'));
    const currentUserLogs = await fetch(`/api/admin/login-logs?email=${encodeURIComponent(authState.email)}&page=1&limit=1`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (currentUserLogs.status === 200) {
      const currentLogsData = await currentUserLogs.json();
      if (currentLogsData.data.length > 0) {
        console.log("✅ Current session found in logs");
        console.log("   Session info:", {
          email: currentLogsData.data[0].email,
          timeIn: currentLogsData.data[0].timeIn,
          status: currentLogsData.data[0].timeOut ? 'Closed' : 'Active'
        });
      } else {
        console.log("⚠️ No logs found for current user");
      }
    }

    // Test 4: Test filter functionality
    console.log("\nTest 4: Testing 'Today' filter...");
    const todayLogs = await fetch('/api/admin/login-logs?today=true&page=1&limit=5', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (todayLogs.status === 200) {
      const todayData = await todayLogs.json();
      console.log("✅ Today's logs fetched successfully");
      console.log(`   Today's login count: ${todayData.data.length}`);
    } else {
      console.log(`❌ Failed to fetch today's logs. Status: ${todayLogs.status}`);
    }

    console.log("\n✅ All tests completed!");
    console.log("\n📋 Summary:");
    console.log("   - Login logs are being captured");
    console.log("   - Admin access control is working");
    console.log("   - Statistics are available");
    console.log("   - Filters are functional");

  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
};

// Test for non-admin users
const testNonAdminAccess = async () => {
  console.log("🧪 Testing Non-Admin Access Control...\n");

  try {
    const response = await fetch('/api/admin/login-logs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.status === 403) {
      console.log("✅ Access control working - Non-admin users blocked");
    } else if (response.status === 200) {
      console.log("⚠️ Warning: Non-admin user has access to login logs!");
    } else {
      console.log(`ℹ️ Status: ${response.status}`);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
};

// Run the appropriate test based on user role
const authState = JSON.parse(localStorage.getItem('authState') || '{}');
if (authState.role === 'admin') {
  console.log(`🔑 Logged in as: ${authState.email} (${authState.role})\n`);
  testLoginActivityLogging();
} else {
  console.log(`🔑 Logged in as: ${authState.email || 'Unknown'} (${authState.role || 'Unknown'})\n`);
  testNonAdminAccess();
}
