'use client'

import { FC } from "react"
import CountUpNumber from "../CountUpNumber/CountUpNumber"

type Props = {
    heading1: React.ReactNode
    section2: React.ReactNode
}

const ClientComponent: FC<Props> = props => {
const { heading1,section2 } = props;

  return <section className="flex justify-center gap-12 container mx-auto">
  <div className="py-10 h-full">
    {heading1}

      <div className="flex justify-between mt-12">
          <div className="flex gap-3 flex-col items-center justify-center w-1/4">
              <p className="text-xs lg:text-xl text-center">Spankings Administered</p>
              <CountUpNumber duration={6000} endValue={5403}/>
          </div>
          <div className="flex gap-3 flex-col items-center justify-center w-1/4">
              <p className="text-xs lg:text-xl text-center">Fantasies Fulfilled</p>
              <CountUpNumber duration={6000} endValue={2440}/>
          </div>
          <div className="flex gap-3 flex-col items-center justify-center w-1/4">
              <p className="text-xs lg:text-xl text-center">Satisfied Guests</p>
              <CountUpNumber duration={8000} endValue={1120}/>
          </div>
      </div>
  </div>
    {section2}
</section>
}

export default ClientComponent