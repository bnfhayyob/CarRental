import React, { useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import Title from '../../components/owner/Title'
import { carService } from '../../api/services'
import { toast } from 'react-hot-toast'
import Loader from '../../components/Loader'

function ManageCars() {
  const currency = import.meta.env.VITE_CURRENCY

  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchOwnerCars = async () => {
    try {
      setLoading(true)
      const response = await carService.getMyCars()
      if (response.success) {
        setCars(response.cars)
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

  const handleToggleAvailability = async (carId) => {
    try {
      const response = await carService.toggleAvailability(carId)
      if (response.success) {
        toast.success('Car availability updated')
        // Update local state
        setCars(cars.map(car =>
          car._id === carId ? { ...car, isAvaliable: !car.isAvaliable } : car
        ))
      } else {
        toast.error('Failed to update availability')
      }
    } catch (error) {
      console.error('Error toggling availability:', error)
      toast.error('Failed to update availability. Please try again.')
    }
  }

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) {
      return
    }

    try {
      const response = await carService.deleteCar(carId)
      if (response.success) {
        toast.success('Car deleted successfully')
        // Remove from local state
        setCars(cars.filter(car => car._id !== carId))
      } else {
        toast.error('Failed to delete car')
      }
    } catch (error) {
      console.error('Error deleting car:', error)
      toast.error('Failed to delete car. Please try again.')
    }
  }

  useEffect(() => {
    fetchOwnerCars()
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
      <Title title="Manage Cars" subTitle="View all listed cars, update their details, or remove them from the booking platform." />

      <div className='max-w-3xl w-full rounded-md overflow-hidden border border-borderColor mt-6'>
        {cars.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-gray-500'>You haven't listed any cars yet.</p>
            <a href='/owner/add-car' className='text-primary hover:underline mt-2 inline-block'>
              Add your first car
            </a>
          </div>
        ) : (
          <table className='w-full border-collapse text-left text-sm text-gray-600'>
            <thead className='text-gray-500'>
              <tr>
                <th className='p-3 font-medium'>Car</th>
                <th className='p-3 font-medium max-md:hidden'>Category</th>
                <th className='p-3 font-medium'>Price</th>
                <th className='p-3 font-medium max-md:hidden'>Status</th>
                <th className='p-3 font-medium'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car._id} className='border-t border-borderColor'>
                  <td className='p-3 flex items-center gap-3'>
                    <img src={car.image} alt="" className='h-12 w-12 aspect-square rounded-md object-cover' />
                    <div className='max-md:hidden'>
                      <p className='font-medium'>{car.brand} {car.model}</p>
                      <p className='text-xs text-gray-500'>{car.seating_capacity} seats • {car.transmission}</p>
                    </div>
                  </td>

                  <td className='p-3 max-md:hidden'>{car.category}</td>
                  <td className='p-3 '>{currency}{car.pricePerDay}/day</td>
                  <td className='p-3 max-md:hidden'>
                    <span className={`px-3 py-1 rounded-full text-xs ${car.isAvaliable ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                      {car.isAvaliable ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  <td className='p-3'>
                    <div className='flex items-center gap-2'>
                      <img
                        src={car.isAvaliable ? assets.eye_close_icon : assets.eye_icon}
                        alt=""
                        className='cursor-pointer hover:opacity-70'
                        onClick={() => handleToggleAvailability(car._id)}
                        title={car.isAvaliable ? 'Mark as unavailable' : 'Mark as available'}
                      />
                      <img
                        src={assets.delete_icon}
                        alt=""
                        className='cursor-pointer hover:opacity-70'
                        onClick={() => handleDeleteCar(car._id)}
                        title='Delete car'
                      />
                    </div>
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

export default ManageCars
