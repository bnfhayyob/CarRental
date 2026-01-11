import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { carService } from '../api/services'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'

const Cars = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCriteria, setSearchCriteria] = useState(null)

  // Get search parameters from URL
  const location = searchParams.get('location')
  const pickupDate = searchParams.get('pickupDate')
  const returnDate = searchParams.get('returnDate')

  useEffect(() => {
    // If search parameters exist, fetch available cars
    if (location && pickupDate && returnDate) {
      fetchAvailableCars(location, pickupDate, returnDate)
    } else {
      fetchCars()
    }
  }, [location, pickupDate, returnDate])

  useEffect(() => {
    // Filter cars based on search input
    if (input.trim() === '') {
      setFilteredCars(cars)
    } else {
      const filtered = cars.filter(car => {
        const searchTerm = input.toLowerCase()
        return (
          car.brand.toLowerCase().includes(searchTerm) ||
          car.model.toLowerCase().includes(searchTerm) ||
          car.category.toLowerCase().includes(searchTerm) ||
          car.fuel_type.toLowerCase().includes(searchTerm) ||
          car.transmission.toLowerCase().includes(searchTerm) ||
          car.location.toLowerCase().includes(searchTerm)
        )
      })
      setFilteredCars(filtered)
    }
  }, [input, cars])

  const fetchCars = async () => {
    try {
      setLoading(true)
      setSearchCriteria(null)
      const response = await carService.getAllCars()
      if (response.success) {
        setCars(response.cars)
        setFilteredCars(response.cars)
      } else {
        toast.error('Failed to fetch cars')
      }
    } catch (error) {
      console.error('Error fetching cars:', error)
      toast.error('Failed to load cars. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableCars = async (loc, startDate, endDate) => {
    try {
      setLoading(true)
      const response = await carService.searchAvailableCars(loc, startDate, endDate)
      if (response.success) {
        setCars(response.cars)
        setFilteredCars(response.cars)
        setSearchCriteria(response.searchCriteria)
      } else {
        toast.error('Failed to fetch available cars')
      }
    } catch (error) {
      console.error('Error fetching available cars:', error)
      toast.error('Failed to load available cars. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    navigate('/cars')
    setSearchCriteria(null)
    setInput('')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div>
      <div className='flex flex-col items-center py-20 bg-light max-md:px-4'>
        <Title title='Available Cars' subTitle='Browse our selection of premium vehicles available for your next adventure' />

        {/* Search Criteria Display */}
        {searchCriteria && (
          <div className='mt-6 bg-white px-6 py-4 rounded-lg shadow-md max-w-140 w-full'>
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div className='flex items-center gap-4 flex-wrap'>
                <div className='flex items-center gap-2'>
                  <img src={assets.location_icon} alt="" className='w-5 h-5' />
                  <span className='text-gray-700 font-medium'>{searchCriteria.location}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <img src={assets.calendar_icon_colored} alt="" className='w-5 h-5' />
                  <span className='text-gray-600 text-sm'>
                    {formatDate(searchCriteria.startDate)} - {formatDate(searchCriteria.endDate)}
                  </span>
                </div>
              </div>
              <button
                onClick={clearSearch}
                className='text-primary hover:text-primary-dull text-sm font-medium transition-colors'
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}

        <div className='flex items-center bg-white px-4 mt-6 max-w-140 w-full h-12 rounded-full shadow'>
          <img src={assets.search_icon} alt="" className='w-4.5 h-4.5 mr-2' />

          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder='search by make, model, or features'
            className='w-full h-full outline-none text-gray-500'
          />

          <img src={assets.filter_icon} alt="" className='w-4.5 h-4.5 mr-2' />
        </div>
      </div>

      <div className='px-6 md:px-16 lg:px-24 xl:px-32 mt-10'>
        <p className='text-gray-500 xl:px-20 max-w-7xl mx-auto'>
          {searchCriteria ? (
            <>
              Showing {filteredCars.length} available car{filteredCars.length !== 1 ? 's' : ''} in {searchCriteria.location}
            </>
          ) : (
            <>
              Showing {filteredCars.length} Car{filteredCars.length !== 1 ? 's' : ''}
            </>
          )}
        </p>
        {filteredCars.length === 0 ? (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-lg'>
              {searchCriteria
                ? `No cars available in ${searchCriteria.location} for the selected dates.`
                : 'No cars found matching your search.'}
            </p>
            {searchCriteria && (
              <button
                onClick={clearSearch}
                className='mt-4 px-6 py-2 bg-primary hover:bg-primary-dull text-white rounded-full transition-colors'
              >
                View All Cars
              </button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4 xl:px-20 max-w-7xl mx-auto'>
            {filteredCars.map((car) => (
              <div key={car._id}>
                <CarCard car={car} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Cars
