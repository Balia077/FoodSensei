import React from 'react'

const HeroText = () => {
  return (
    <div className='w-full h-[85vh] p-10 flex'>
      <h1 className='heroText py-20 font-[thunder-font] text-black tracking-wider text-8xl leading-15 uppercase'>Your Personal <br /> <span className='sensei font-[font-1] leading-20 tracking-wider z-10 text-[23vh] text-[#F30819] capitalize'>Sensei</span> <br /> </h1>
      <span className='heroText z-1 font-[thunder-font] text-black tracking-wider text-8xl absolute top-91.5 uppercase'>AI Nutrition</span>
      <div className='h-17.5 w-30 top-92 absolute left-115'>
        <img className='h-full w-full object-cover rounded-xl overflow-hidden' src="/images/nutrition.webp" alt="" />
      </div>
    </div>
  )
}

export default HeroText
