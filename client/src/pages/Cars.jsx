import React, { useState, useEffect } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import CarCard from '../components/CarCard'
import { carService } from '../api/services'
import { toast } from 'react-hot-toast'
import Loader from '../components/Loader'

const Cars = () => {
  const [input, setInput] = useState('')
  const [cars, setCars] = useState([])
  const [filteredCars, setFilteredCars] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCars()
  }, [])

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
          Showing {filteredCars.length} Car{filteredCars.length !== 1 ? 's' : ''}
        </p>
        {filteredCars.length === 0 ? (
          <div className='text-center py-20'>
            <p className='text-gray-500 text-lg'>No cars found matching your search.</p>
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
