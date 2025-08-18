import React from 'react'

const CarCard = ({car}) => {
  return (
    <div className='group rouneded-xl overflow-hidden shadow-lg hover:-translate-y-1 transition-all duration-500 cursor-pointer'>
        <div>
            <img src={car.image} alt="car image" className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'/>

            {car.isAvailable && <p className='absolute top-4 left-4 bg-primary/90 text-white text-xs px-2.5 py-1 rounded-full'>Available Now</p>}
        </div>

        <div className='absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm text-white px-3 py-2 rounded-lg'>
            <span className='font-semibold'>${car.pricePerDay}</span>
            <span className='text-sm text-white/80'> / day</span>
        </div>
    </div> 
  )
}

export default CarCard