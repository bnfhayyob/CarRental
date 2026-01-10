import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { ownerService } from '../../api/services'
import { toast } from 'react-hot-toast'
import Loader from '../../components/Loader'

const Dashboard = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const [loading, setLoading] = useState(true)

  const [data, setData] = useState({
    totalCars: 0,
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentBookings: [],
    monthlyRevenue: 0,
  })

  const dashboardCards = [
    { title: "Total Cars", value: data.totalCars, icon: assets.carIconColored },
    { title: "Total Bookings", value: data.totalBookings, icon: assets.listIconColored },
    { title: "Pending", value: data.pendingBookings, icon: assets.cautionIconColored },
    { title: "Confirmed", value: data.completedBookings, icon: assets.listIconColored },
  ]

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await ownerService.getDashboardStats()
      if (response.success) {
        setData(response.data)
      } else {
        toast.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // If the endpoint doesn't exist, show a message but don't error
      if (error.response?.status === 404) {
        toast.error('Dashboard statistics endpoint not yet implemented on server')
      } else {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='px-4 pt-10 md:px-10 flex-1'>
      <Title title='Owner Dashboard' subTitle='Monitor overall platform performance including total cars, bookings, revenue, and recent activities' />
      <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 my-8 max-w-3xl'>
        {dashboardCards.map((card, index) => (
          <div key={index} className='flex gap-2 items-center justify-between p-4 rounded-md border border-borderColor'>
            <div>
              <h1 className='text-xs text-gray-500'>{card.title}</h1>
              <p className='text-lg font-semibold'>{card.value}</p>
            </div>
            <div className='flex items-center justify-center w-10 h-10 rounded-full bg-primary/10'>
              <img src={card.icon} alt="" className='h-4 w-4' />
            </div>
          </div>
        ))}
      </div>

      <div className='flex flex-wrap items-start gap-6 mb-8 w-full'>
        {/* Recent Bookings */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-lg w-full'>
          <h1 className='text-lg font-medium'>Recent Bookings</h1>
          <p className='text-gray-500'>Latest customer bookings</p>
          {data.recentBookings && data.recentBookings.length > 0 ? (
            data.recentBookings.map((booking, index) => (
              <div key={index} className='mt-4 flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-primary/10'>
                    <img src={assets.listIconColored} alt="" className='h-5 w-5' />
                  </div>
                  <div>
                    <p>{booking.car.brand} {booking.car.model}</p>
                    <p className='text-sm text-gray-500'>{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className='flex items-center gap-2 font-medium'>
                  <p className='text-sm text-gray-500'>{currency} {booking.price}</p>
                  <p className='px-3 py-0.5 border border-borderColor rounded-full text-sm capitalize'>{booking.status}</p>
                </div>
              </div>
            ))
          ) : (
            <p className='text-gray-400 mt-4'>No recent bookings</p>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className='p-4 md:p-6 border border-borderColor rounded-md max-w-xs w-full'>
          <h1 className='text-lg font-medium'>Monthly Revenue</h1>
          <p className='text-gray-500'>Revenue for current month</p>
          <p className='text-3xl mt-6 font-semibold text-primary'>{currency} {data.monthlyRevenue} </p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
