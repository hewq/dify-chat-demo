import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center border-x border-slate-200 bg-white px-6 py-16 text-center text-slate-600">
      <section className="flex w-full max-w-2xl flex-col items-center gap-8">
        <div className="relative">
          <img
            src={heroImg}
            className="relative z-0 h-auto w-[170px]"
            width="170"
            height="179"
            alt=""
          />
          <img
            src={reactLogo}
            className="absolute inset-x-0 top-[34px] z-10 mx-auto h-7"
            style={{
              transform:
                'perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg) scale(1.4)',
            }}
            alt="React logo"
          />
          <img
            src={viteLogo}
            className="absolute inset-x-0 top-[107px] z-0 mx-auto h-[26px] w-auto"
            style={{
              transform:
                'perspective(2000px) rotateZ(300deg) rotateX(40deg) rotateY(39deg) scale(0.8)',
            }}
            alt="Vite logo"
          />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Get started
          </h1>
          <p className="text-base leading-7 sm:text-lg">
            Edit{' '}
            <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm text-slate-950">
              src/App.tsx
            </code>{' '}
            and save to test{' '}
            <code className="rounded-md bg-slate-100 px-2 py-1 font-mono text-sm text-slate-950">
              HMR
            </code>
          </p>
        </div>
        <button
          type="button"
          className="rounded-xl bg-slate-950 px-5 py-3 font-mono text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
          onClick={() => setCount((count) => count + 1)}
        >
          Count is {count}
        </button>
      </section>
    </main>
  )
}

export default App
