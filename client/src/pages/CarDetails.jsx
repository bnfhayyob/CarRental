import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loader from '../components/Loader'
import { carService, bookingService } from '../api/services'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const CarDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [pickupDate, setPickupDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [totalPrice, setTotalPrice] = useState(0)
  const currency = import.meta.env.VITE_CURRENCY
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    fetchCarDetails()
  }, [id])

  useEffect(() => {
    // Calculate total price based on dates
    if (pickupDate && returnDate && car) {
      const pickup = new Date(pickupDate)
      const returnD = new Date(returnDate)
      const days = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24))
      if (days > 0) {
        setTotalPrice(days * car.pricePerDay)
      } else {
        setTotalPrice(0)
      }
    }
  }, [pickupDate, returnDate, car])

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const response = await carService.getCarById(id)
      if (response.success) {
        setCar(response.car)
      } else {
        toast.error('Car not found')
        navigate('/cars')
      }
    } catch (error) {
      console.error('Error fetching car details:', error)
      toast.error('Failed to load car details')
      navigate('/cars')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Please login to book a car')
      return
    }

    if (!pickupDate || !returnDate) {
      toast.error('Please select pickup and return dates')
      return
    }

    const pickup = new Date(pickupDate)
    const returnD = new Date(returnDate)

    if (returnD <= pickup) {
      toast.error('Return date must be after pickup date')
      return
    }

    try {
      setSubmitting(true)
      const bookingData = {
        carId: car._id,
        pickupDate,
        returnDate,
      }

      const response = await bookingService.createBooking(bookingData)
      if (response.success) {
        toast.success('Booking created successfully!')
        navigate('/my-bookings')
      } else {
        toast.error(response.message || 'Failed to create booking')
      }
    } catch (error) {
      console.error('Booking error:', error)
      toast.error(error.response?.data?.message || 'Failed to create booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader />
      </div>
    )
  }

  return car ? (
    <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-16'>
      <button onClick={() => navigate(-1)} className='flex items-center gap-2 mb-6 text-gray-500 cursor-pointer'>
        <img src={assets.arrow_icon} alt="" className='rotate-180 opacity-65' /> Back to all cars
      </button>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12'>
        {/* Left: Car Image & Details */}
        <div className='lg:col-span-2'>
          <img src={car.image} alt="" className='w-full h-auto md:max-h-100 object-cover rounded-xl mb-6 shadow-md' />
          <div className='space-y-6'>
            <div>
              <h1 className='text-3xl font-bold'>{car.brand} {car.model}</h1>
              <p className='text-gray-500 text-lg'>{car.category} • {car.year} </p>
              <div className='mt-2'>
                {car.isAvaliable ? (
                  <span className='inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm'>Available</span>
                ) : (
                  <span className='inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm'>Not Available</span>
                )}
              </div>
            </div>
          </div>
          <hr className='border-borderColor my-6' />

          <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
            {[
              { icon: assets.users_icon, text: `${car.seating_capacity} Seats` },
              { icon: assets.fuel_icon, text: car.fuel_type },
              { icon: assets.car_icon, text: car.transmission },
              { icon: assets.location_icon, text: car.location },
            ].map(({ icon, text }) => (
              <div key={text} className='flex flex-col items-center bg-light p-4 rounded-lg'>
                <img src={icon} alt="" className='h-5 mb-2' />
                {text}
              </div>
            ))}
          </div>

          {/* Description */}
          <div className='mt-6'>
            <h1 className='text-xl font-medium mb-3'>Description</h1>
            <p className='text-gray-500'>{car.description}</p>
          </div>

          {/* Features */}
          <div className='mt-6'>
            <h1 className='text-xl font-medium mb-3'>Features</h1>
            <ul className='grid grid-cols-1 sm:grid-cols-2'>
              {
                ["360 Camera", "Bluetooth", "GPS", "Heated Seats", "Rear View Mirror"].map((item) => (
                  <li key={item} className='flex items-center text-gray-500'>
                    <img src={assets.check_icon} className='h-4 mr-2' alt="" />
                    {item}
                  </li>
                ))
              }
            </ul>
          </div>
        </div>

        {/* Right: Booking Form */}
        <form onSubmit={handleSubmit} className='shadow-lg h-max sticky top-18 rounded-xl p-6 space-y-6 text-gray-500'>
          <p className='flex items-center justify-between text-2xl text-gray-800 font-semibold'>{currency}{car.pricePerDay} <span className='text-base text-gray-400 font-normal'>per day</span> </p>
          <hr className='border-borderColor my-6' />

          <div className='flex flex-col gap-2'>
            <label htmlFor="pickup-date">Pickup Date</label>
            <input
              type="date"
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
              id='pickup-date'
              min={new Date().toISOString().split('T')[0]}
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor="return-date">Return Date</label>
            <input
              type="date"
              className='border border-borderColor px-3 py-2 rounded-lg'
              required
              id='return-date'
              min={pickupDate || new Date().toISOString().split('T')[0]}
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
            />
          </div>

          {totalPrice > 0 && (
            <div className='bg-light p-4 rounded-lg'>
              <div className='flex justify-between text-gray-700'>
                <span>Total Price:</span>
                <span className='text-xl font-semibold text-primary'>{currency}{totalPrice}</span>
              </div>
              <p className='text-sm text-gray-500 mt-1'>
                {Math.ceil((new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))} day(s) × {currency}{car.pricePerDay}
              </p>
            </div>
          )}

          <button
            type='submit'
            disabled={!car.isAvaliable || submitting}
            className='w-full bg-primary hover:bg-primary-dull transition-all py-3 font-medium text-white rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {submitting ? 'Booking...' : 'Book Now'}
          </button>

          <p className='text-center text-sm'>No credit card required to reserve</p>
        </form>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center min-h-screen'>
      <Loader />
    </div>
  )
}

export default CarDetails
