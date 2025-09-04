import React, { useState } from 'react'
import Title from '../../components/owner/Title'
import { assets } from '../../assets/assets'

const AddCar = () => {

  const [image,setImage] = useState(null)
  const [car, setCar] = useState({
    brand:'',
    model:'',
    year:0,
    pricePerDay:0,
    category:'',
    fuel_type:'',
    seating_capacity:0,
    location:'',
    description:'',
  })

  const onSubmitHandler = async (e) =>{
    e.preventDefault()
  }

  return (
    <div className='px-4 py-10 md:px-10 flex-1'>
      <Title title="Add New Car" subTitle="Fill in details to list a new car for booking, including pricing, availability, and car specificaions."/>
        
      <form onSubmit={onSubmitHandler} className='flex flex-col gap-5 text-gray-500 text-sm mt-6 max-w-xl'>
        {/* Car Image */}
        <div>
          <label htmlFor="car-image">
            <img src={image ? URL.createObjectURL(image) : assets.upload_icon} alt="" className='h-14 rounded cursor-pointer'/>
            <input onChange={e=>setImage(e.target.files[0])} type="file" id='car-image' accept='image/*' hidden />
          </label>
          <p className='text-sm text-gray-500'>Upload a picture of your car</p>
        </div>

        {/* Car Brand and Model */}
        <div className='grid grid-col-1 md:grid-cols-2 gap-6'>
          <div className='flex flex-xol w-full'>
            <label>Brand</label>
            <input type="text" placeholder='e.g. BMW, Mercedes, Audi...' required className='px-3 py-2 mt-1 border border-borderColor rounded-md outline-none' value={car.brand} onChange={e=>setCar({...car,brand:e.target.value})}/>
          </div>
          <div></div>
        </div>
      </form>
    </div>
  )
}

export default AddCar