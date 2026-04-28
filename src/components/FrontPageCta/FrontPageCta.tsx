'use client'

import Link from 'next/link';
const FrontPageCta = () => {
return (
    <>
 {/* Call To Action */}
   <section className="container mx-auto py-8 px-4 md:px-0 border-2 border-tertiary-dark rounded-lg ">
     <div className="max-w-4xl mx-auto text-center">
       <h3 className="text-2xl font-orbitron mb-4">Curious? Click here to begin your journey</h3>
       <Link href="/rooms" className="inline-block bg-primary text-white px-24 py-6 rounded-lg hover:bg-white dark:hover:bg-black text-xl font-bold transition border-2 border-tertiary-dark">Book Your Stay</Link>
     </div>
   </section>
</>
)
}

export default FrontPageCta;
