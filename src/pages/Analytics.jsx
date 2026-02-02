import React, { useState } from 'react'

import Sidebar from '../components/Sidebar'

import Navbar from '../components/Navbar'

import API from '../utils/api'

import {

  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,

  CartesianGrid

} from 'recharts'

import {

  ArrowUpIcon, CheckCircleIcon, XCircleIcon, BookOpenIcon, ClockIcon

} from '@heroicons/react/24/outline'



// Define custom colors for a more vibrant and distinct look

const CHART_COLORS = {

  sent: '#6366F1',     // Indigo-500

  delivered: '#10B981', // Green-500

  read: '#3B82F6',     // Blue-500

  failed: '#EF4444',   // Red-500

}



// Helper component for a modern Stat Card

const StatCard = ({ title, value, color, icon: Icon }) => (

  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1">

    <div className="flex items-start justify-between">

      <div className="flex-shrink-0">

        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-opacity-20" style={{ backgroundColor: color + '20' }}>

          <Icon className="w-5 h-5" style={{ color }} />

        </div>

      </div>

      <p className="ml-3 text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>

    </div>

    <p className="mt-4 text-4xl font-extrabold text-gray-900">{value}</p>

  </div>

)



// Helper component to get status badge style

const getStatusBadge = (status) => {

  switch (status) {

    case 'delivered':

      return 'bg-green-100 text-green-800'

    case 'failed':

      return 'bg-red-100 text-red-800'

    case 'read':

      return 'bg-blue-100 text-blue-800'

    case 'sent':

      return 'bg-indigo-100 text-indigo-800'

    default:

      return 'bg-gray-100 text-gray-800'

  }

}



export default function Analytics() {

  const [campaignId, setCampaignId] = useState('')

  const [summary, setSummary] = useState(null)

  const [logs, setLogs] = useState([])

  const [loading, setLoading] = useState(false)



  // Pagination states

  const [currentPage, setCurrentPage] = useState(1)

  const rowsPerPage = 10



  async function getStats() {

    if (!campaignId) return alert('Please enter a Campaign ID.')

    setLoading(true)

    setSummary(null)

    setLogs([])

   

    try {

      const res = await API.get(`/analytics/campaign/${campaignId}`)

      const rawSummary = res.data.summary || {}



      // Summary data for Recharts (Modern format)

      setSummary([

        {

          name: 'Sent',

          value: rawSummary.sent || 0,

          color: CHART_COLORS.sent,

          icon: ArrowUpIcon,

          fill: CHART_COLORS.sent

        },

        {

          name: 'Delivered',

          value: rawSummary.delivered || 0,

          color: CHART_COLORS.delivered,

          icon: CheckCircleIcon,

          fill: CHART_COLORS.delivered

        },

        {

          name: 'Read',

          value: rawSummary.read || 0,

          color: CHART_COLORS.read,

          icon: BookOpenIcon, // Changed from EyeIcon to BookOpenIcon for variety

          fill: CHART_COLORS.read

        },

        {

          name: 'Failed',

          value: rawSummary.failed || 0,

          color: CHART_COLORS.failed,

          icon: XCircleIcon,

          fill: CHART_COLORS.failed

        },

      ])



      setLogs(res.data.logs || [])

      setCurrentPage(1)

    } catch (err) {

      console.error(err)

      alert('Failed to fetch stats. Please check the Campaign ID.')

    } finally {

      setLoading(false)

    }

  }



  // Pagination logic

  const totalPages = Math.ceil(logs.length / rowsPerPage)

  const startIndex = (currentPage - 1) * rowsPerPage

  const currentLogs = logs.slice(startIndex, startIndex + rowsPerPage)



  return (

    <div className="flex bg-gray-50 min-h-screen">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-4 md:p-8">

          <h1 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">Campaign Analytics Dashboard</h1>

         

          {/* Campaign ID Input and Button (Cleaned up) */}

          <div className="bg-white p-5 rounded-xl shadow-md mb-8">

            <div className="flex flex-col sm:flex-row gap-4 items-center">

              <label htmlFor="campaign-id" className="text-sm font-medium text-gray-700 w-full sm:w-auto sm:whitespace-nowrap">

                Enter Campaign ID:

              </label>

              <input

                id="campaign-id"

                value={campaignId}

                onChange={e => setCampaignId(e.target.value)}

                placeholder="e.g., c-12345abc"

                className="p-3 border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 block w-full rounded-lg shadow-sm transition duration-150"

              />

              <button

                onClick={getStats}

                disabled={loading}

                className="w-full sm:w-48 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"

              >

                {loading ? (

                  <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">

                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>

                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>

                  </svg>

                ) : 'Analyze Campaign'}

              </button>

            </div>

          </div>



          {/* Stat Cards (Improved design with color accent and hover effect) */}

          {summary && (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

              {summary.map((stat) => (

                <StatCard

                  key={stat.name}

                  title={stat.name}

                  value={stat.value}

                  color={stat.color}

                  icon={stat.icon}

                />

              ))}

            </div>

          )}



          {/* Summary Chart - Focus on better data visualization */}

          {summary && (

            <div className="mb-10 p-6 bg-white rounded-xl shadow-lg">

              <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">Delivery Overview Chart</h3>

              <ResponsiveContainer width="100%" height={350}>

                <BarChart data={summary} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

                  {/* Clean up CartesianGrid for a modern look */}

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />

                  <XAxis dataKey="name" axisLine={false} tickLine={false} stroke="#555" />

                  <YAxis axisLine={false} tickLine={false} stroke="#555" />

                  <Tooltip

                    cursor={{ fill: 'rgba(0,0,0,0.08)' }}

                    contentStyle={{ borderRadius: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}

                    formatter={(value, name) => [`${value} messages`, name]}

                  />

                  <Legend

                    verticalAlign="top"

                    height={36}

                    iconType="circle" // Use circles for legend icons

                  />

                  {/* Corrected Bar component to use dynamic fill color */}

                  <Bar dataKey="value" name="Count" radius={[8, 8, 0, 0]}>

                    {

                      summary.map((entry, index) => (

                        <Bar key={`bar-${index}`} dataKey="value" fill={entry.fill} />

                      ))

                    }

                  </Bar>

                </BarChart>

              </ResponsiveContainer>

            </div>

          )}



          {/* Detailed Logs Table - Modernized and cleaner */}

          {logs.length > 0 && (

            <div className="bg-white p-6 rounded-xl shadow-lg">

              <div className="flex justify-between items-center mb-4 border-b pb-3">

                <h3 className="text-xl font-bold text-gray-800">Detailed Message Logs</h3>

                <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">

                  Total Records: {logs.length}

                </span>

              </div>

             

              <div className="overflow-x-auto">

                <table className="min-w-full divide-y divide-gray-200">

                  <thead className="bg-gray-100">

                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Phone Number</th>

                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>

                    </tr>

                  </thead>

                  <tbody className="bg-white divide-y divide-gray-100">

                    {currentLogs.map((log, idx) => (

                      <tr key={startIndex + idx} className="hover:bg-gray-50 transition duration-150">

                        <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-gray-900">{log.to}</td>

                        <td className="px-6 py-3 whitespace-nowrap">

                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(log.status)} capitalize`}>

                            {log.status}

                          </span>

                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>



              {/* Pagination Controls - Modern and spacious */}

              <div className="flex justify-center items-center mt-6 space-x-6">

                <button

                  disabled={currentPage === 1}

                  onClick={() => setCurrentPage(p => p - 1)}

                  className="px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"

                >

                  &larr; Previous Page

                </button>

               

                <span className="text-sm font-medium text-gray-700">

                  Page <span className="font-extrabold text-indigo-600">{currentPage}</span> of <span className="font-extrabold text-indigo-600">{totalPages}</span>

                </span>

               

                <button

                  disabled={currentPage === totalPages || totalPages === 0}

                  onClick={() => setCurrentPage(p => p + 1)}

                  className="px-4 py-2 border border-indigo-300 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150"

                >

                  Next Page &rarr;

                </button>

              </div>

            </div>

          )}



          {/* No Data Message */}

          {!loading && !summary && campaignId && (

              <div className="text-center p-10 bg-white rounded-xl shadow-lg text-gray-500 border border-dashed border-gray-300">

                  <ClockIcon className="w-10 h-10 mx-auto text-indigo-500 mb-4"/>

                  <p className="text-lg font-medium">No analytics data found for Campaign ID: **{campaignId}**.</p>

                  <p className="text-sm mt-1">Please ensure the Campaign ID is correct and data has been processed.</p>

              </div>

          )}



        </main>

      </div>

    </div>

  )

}