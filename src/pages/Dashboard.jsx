import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import Navbar from '../components/Navbar'
import API from '../utils/api'
import {
  UsersIcon, MegaphoneIcon, DocumentTextIcon, CheckBadgeIcon, ClockIcon, ArrowPathIcon
} from '@heroicons/react/24/outline'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// --- Helper Components ---

// 1. Modern Stat Card Component
const DashboardStatCard = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <p className="mt-2 text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
);

// 2. Dummy Chart Data (Recharts के लिए, क्योंकि API में यह नहीं था)
// यह केवल डैशबोर्ड को आकर्षक बनाने के लिए है। रियल डेटा होने पर इसे रिप्लेस किया जा सकता है।
const chartData = [
  { name: 'Mon', Sent: 4500, Failed: 500 },
  { name: 'Tue', Sent: 3200, Failed: 180 },
  { name: 'Wed', Sent: 5100, Failed: 700 },
  { name: 'Thu', Sent: 2780, Failed: 300 },
  { name: 'Fri', Sent: 6000, Failed: 900 },
  { name: 'Sat', Sent: 3900, Failed: 250 },
  { name: 'Sun', Sent: 4800, Failed: 600 },
];

// 3. Helper function for campaign status badge
const getCampaignStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
        case 'completed': return 'text-green-700 bg-green-100';
        case 'failed': return 'text-red-700 bg-red-100';
        case 'running': return 'text-blue-700 bg-blue-100';
        case 'pending': return 'text-yellow-700 bg-yellow-100';
        default: return 'text-gray-700 bg-gray-100';
    }
};


// --- Dashboard Component ---

export default function Dashboard() {
  // messagesSent को API से नहीं लिया जा रहा है, इसलिए इसे 0 रखा गया है
  const [counts, setCounts] = useState({ contacts: 0, campaigns: 0, templates: 0, messagesSent: 0 }) 
  const [recentCampaigns, setRecentCampaigns] = useState([]) // Recent campaigns के लिए डमी डेटा उपयोग करेंगे
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        // --- यह आपका ORIGINAL API LOGIC है ---
        const [cRes, campRes, tRes] = await Promise.all([
          API.get('/contacts'), // Original: Fetches array
          API.get('/campaigns'), // Original: Fetches array
          API.get('/templates'), // Original: Fetches array
        ]);

        const getCountFromResponse = (res) => Array.isArray(res.data) ? res.data.length : (res.data.total || 0);

        setCounts({
          contacts: getCountFromResponse(cRes),
          campaigns: getCountFromResponse(campRes),
          templates: getCountFromResponse(tRes),
          // messagesSent को 0 पर रखा गया है, क्योंकि इसका API कॉल ओरिजिनल कोड में नहीं था
          messagesSent: 0, 
        });

        // --- Recent Campaigns के लिए डमी डेटा ---
        // क्योंकि आपके ओरिजिनल कोड में इसका API कॉल नहीं था, 
        // हम एक आकर्षक डैशबोर्ड दिखाने के लिए डमी डेटा का उपयोग कर रहे हैं।
        const dummyCampaigns = [
          { name: 'Sample Offer Campaign', status: 'completed', date: '2 hours ago' },
          { name: 'Weekly Follow-up Run', status: 'running', date: 'Yesterday' },
          { name: 'New Lead Outreach', status: 'pending', date: 'Today' },
        ];
        setRecentCampaigns(dummyCampaigns);


      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData()
  }, [])

  if (loading) {
    return (
        <div className="flex bg-gray-50 min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col items-center justify-center">
            <Navbar />
            <div className="flex flex-col items-center p-20">
              <ArrowPathIcon className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-lg text-gray-600">Loading Dashboard Data...</p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-4 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
          
          {/* 1. Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <DashboardStatCard 
              title="Total Contacts" 
              value={counts.contacts} 
              color="#3B82F6" 
              icon={UsersIcon} 
            />
            <DashboardStatCard 
              title="Total Campaigns" 
              value={counts.campaigns} 
              color="#6366F1" 
              icon={MegaphoneIcon} 
            />
            <DashboardStatCard 
              title="Saved Templates" 
              value={counts.templates} 
              color="#10B981" 
              icon={DocumentTextIcon} 
            />
            <DashboardStatCard 
              title="Messages Sent" 
              value={counts.messagesSent} // यह 0 होगा जब तक आप API में messagesSent का काउंट नहीं जोड़ते
              color="#EF4444" 
              icon={CheckBadgeIcon} 
            />
          </div>

          {/* 2. Charts and Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Chart: Message Volume */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-indigo-600">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Message Volume & Failure Rate (Sample Data)</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #ccc' }}
                    formatter={(value, name) => [value.toLocaleString(), name]}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }}/>
                  
                  {/* Area Charts with Gradients for a modern look */}
                  <Area type="monotone" dataKey="Sent" stroke="#6366F1" fillOpacity={1} fill="url(#colorSent)" name="Total Sent" />
                  <Area type="monotone" dataKey="Failed" stroke="#EF4444" fillOpacity={1} fill="url(#colorFailed)" name="Failed" />
                  
                  {/* Gradient definitions */}
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Campaigns List */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-600">
              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Recent Campaign Activity</h3>
              
              <ul className="divide-y divide-gray-100">
                {recentCampaigns.map((camp, index) => (
                  <li key={index} className="py-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <p className="text-sm font-medium text-gray-900 truncate">{camp.name || `Campaign #${index + 1}`}</p>
                      <p className="text-xs text-gray-500">{camp.date || 'Just now'}</p>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getCampaignStatusBadge(camp.status)}`}>
                      {camp.status || 'Processing'}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-center">
                <a href="/campaigns" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
                    View All Campaigns &rarr;
                </a>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  )
}