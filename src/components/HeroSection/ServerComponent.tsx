import Image from "next/image";
export const heading1 = (
<>
    <h1 className="font-orbitron mb-6 font-heading">
       Dungeon Next Door
    </h1>
    <p className="text-[#4a4a4a] dark:text-[#ffffffea] max-w-lg">
    Prepare for an Unforgettable Experience During Your Stay</p>
    {/* <button className="btn-primary md:w-auto w-full">
        Get Started
    </button> */}
</>
);

export const section2 = (
    <>
      <div className="md:grid hidden gap-8 grid-cols-1 w-1/3 mb-10">
      <div className="rounded-2xl overflow-hidden h-48">
          <Image
              src='/images/hero-1.jpg'
              alt='hero-1'
              width={500}
              height={300}
              className="img scale-animation"
          />
      </div>
      <div className='grid grid-cols-2 gap-8 h-48'>
          <div className="rounded-2xl overflow-hidden">
              <Image
                  src='/images/hero-2.jpg'
                  alt='hero-2'
                  width={300}
                  height={300}
                  className="img scale-animation"
              /></div>
          <div className="rounded-2xl overflow-hidden">
              <Image
                  src='/images/hero-3.jpg'
                  alt='hero-3'
                  width={300}
                  height={300}
                  className="img scale-animation"
              />
          </div>
      </div>
  </div></>
)