import React, { useEffect, useState } from 'react'
import Title from '../../components/owner/Title'
import { bookingService } from '../../api/services'
import { toast } from 'react-hot-toast'
import Loader from '../../components/Loader'

function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const currency = import.meta.env.VITE_CURRENCY

  const fetchOwnerBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingService.getOwnerBookings()
      if (response.success) {
        setBookings(response.bookings)
      } else {
        toast.error('Failed to fetch bookings')
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
      toast.error('Failed to load bookings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await bookingService.updateBookingStatus(bookingId, newStatus)
      if (response.success) {
        toast.success('Booking status updated')
        // Update local state
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status: newStatus } : booking
        ))
      } else {
        toast.error('Failed to update booking status')
      }
    } catch (error) {
      console.error('Error updating booking status:', error)
      toast.error('Failed to update status. Please try again.')
    }
  }

  useEffect(() => {
    fetchOwnerBookings()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='px-4 pt-10 md:px-10 w-full'>
      <Title title="Manage Bookings" subTitle="Track all customer bookings, approve or cancel requests, and manage booking statuses." />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        {bookings.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-gray-500'>No bookings found for your cars.</p>
          </div>
        ) : (
          <table className='w-full border-collapse text-left text-sm text-gray-600'>
            <thead className='text-gray-500'>
              <tr>
                <th className='p-3 font-medium'>Car</th>
                <th className='p-3 font-medium max-md:hidden'>Date Range</th>
                <th className='p-3 font-medium'>Total</th>
                <th className='p-3 font-medium max-md:hidden'>Payment</th>
                <th className='p-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className='border-t border-borderColor text-gray-500'>
                  <td className='p-3 flex items-center gap-3'>
                    <img src={booking.car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                    <p>{booking.car.brand} {booking.car.model}</p>
                  </td>
                  <td className='max-md:hidden'>
                    {new Date(booking.pickupDate).toLocaleDateString()} to {new Date(booking.returnDate).toLocaleDateString()}
                  </td>
                  <td className='p-3'>
                    {currency}{booking.price}
                  </td>
                  <td className='max-md:hidden'>
                    <span className='bg-gray-100 px-3 py-1 rounded-full text-xs'>Offline</span>
                  </td>
                  <td className='p-3'>
                    {booking.status === 'pending' ? (
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                        className='px-2 py-1.5 mt-1 text-gray-500 border border-borderColor rounded-md outline-none'
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold capitalize ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'
                      }`}>
                        {booking.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ManageBookings
