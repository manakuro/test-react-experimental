import { StrictMode, Suspense } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { Subject } from "rxjs";
import { act, fireEvent, render } from "@testing-library/react";


beforeEach(() => {
  jest.useFakeTimers()
})
afterEach(() => {
  jest.runAllTimers()
  jest.useRealTimers()
})

it('writable count state without initial value', async () => {
  const subject = new Subject()
  const observableAtom = atomWithObservable(() => subject)

  const CounterValue = () => {
    const state = useAtomValue(observableAtom)
    return <>count: {state}</>
  }

  const CounterButton = () => {
    const dispatch = useSetAtom(observableAtom)
    return <button onClick={() => dispatch(9)}>button</button>
  }

  const { findByText, getByText } = render(
    <StrictMode>
      <>
        <Suspense fallback="loading">
          <CounterValue />
        </Suspense>
        <CounterButton />
      </>
    </StrictMode>
  )
  // Should show loading while the promise is pending.
  await findByText('loading')

  // The promise is resolved through dispatch(9).
  fireEvent.click(getByText('button'))

  // flushActQueue got stuck here.

  // Then CounterValue component should consume the dispatched value.
  await findByText('count: 9')

  act(() => subject.next(3))
  await findByText('count: 3')
})
