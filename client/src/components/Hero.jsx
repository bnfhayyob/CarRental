import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets, cityList } from '../assets/assets'
import { toast } from 'react-hot-toast'

const Hero = () => {
    const navigate = useNavigate()
    const [pickupLocation, setPickupLocation] = useState('')
    const [pickupDate, setPickupDate] = useState('')
    const [returnDate, setReturnDate] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()

        // Validation
        if (!pickupLocation) {
            toast.error('Please select a pickup location')
            return
        }

        if (!pickupDate) {
            toast.error('Please select a pickup date')
            return
        }

        if (!returnDate) {
            toast.error('Please select a return date')
            return
        }

        // Validate dates
        const pickup = new Date(pickupDate)
        const returnD = new Date(returnDate)

        if (returnD <= pickup) {
            toast.error('Return date must be after pickup date')
            return
        }

        // Navigate to cars page with search parameters
        navigate(`/cars?location=${encodeURIComponent(pickupLocation)}&pickupDate=${pickupDate}&returnDate=${returnDate}`)
    }

  return (
    <div className='h-screen flex flex-col items-center justify-center gap-14 bg-light text-center'>
        <h1 className='tex-4xl md:text-5xl font-semibold'>Luxury cars on Rent</h1>
        <form onSubmit={handleSearch} className='flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-lg md:rounded-full w-full max-w-80 md:max-w-200 bg-white shadow-[0px_8px_20px_rgba(0,0,0,0.1)]'>

            <div className='flex flex-col md:flex-row items-start md:items-center gap-10 min-md:ml-8'>
                <div className='flex flex-col items-start gap-2'>
                    <select value={pickupLocation} onChange={(e)=>setPickupLocation(e.target.value)} required>
                        <option value="">Pickup Location</option>
                        {cityList.map((city)=><option key={city} value={city}>{city}</option>)}
                    </select>
                    <p className='px-1 text-sm text-gray-500'> {pickupLocation ? pickupLocation : 'Please select Location'} </p>
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <label htmlFor="pickup-date">Pick-up Date</label>
                    <input
                        type="date"
                        id='pickup-date'
                        value={pickupDate}
                        onChange={(e) => setPickupDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className='text-sm text-gray-500'
                        required
                    />
                </div>
                <div className='flex flex-col items-start gap-2'>
                    <label htmlFor="return-date">Return Date</label>
                    <input
                        type="date"
                        id='return-date'
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={pickupDate || new Date().toISOString().split('T')[0]}
                        className='text-sm text-gray-500'
                        required
                    />
                </div>
            </div>
            <button type='submit' className='flex items-center justify-center gap-1 px-9 py-3 max-sm:mt4 bg-primary hover:bg-primary-dull text-white rounded-full cursor-pointer'>
                <img src={assets.search_icon} alt="search" className='brightness-300'/>
                Search
            </button>
        </form>
        <img src={assets.main_car} alt="car" className='max-h-74'/>
    </div>
  )
}

export default Hero