import React from 'react'

const HeroText = () => {
  return (
    <div className='w-full h-[85vh] lg:p-10 p-5 flex'>
      <h1 className='heroText lg:py-20 py-10 font-[thunder-font] text-black tracking-wider lg:text-[18vh] text-[7vh] lg:leading-15 leading-12 uppercase'>Your Personal <br /> <span className='sensei font-[font-1] lg:leading-30 leading-0 tracking-wider z-10 lg:text-[30.5vh] text-[12vh] text-[#F30819] capitalize'>Sensei</span> <br /> </h1>
      <span className='heroText z-1 font-[thunder-font] text-black tracking-wider lg:text-[18vh] text-[7vh] absolute lg:top-94 top-50.5 uppercase'>AI Nutrition</span>
      <div className='lg:h-24 lg:w-35 h-10 w-14 lg:top-103 top-53 absolute lg:left-155 left-56'>
        <img className='h-full w-full object-cover rounded-xl overflow-hidden' src="/images/nutrition.webp" alt="" />
      </div>
    </div>
  )
}

export default HeroText
