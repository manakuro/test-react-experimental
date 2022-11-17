import { StrictMode, Suspense } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { Subject } from "rxjs";
import { act, fireEvent, render } from "@testing-library/react";

it("writable count state without initial value", async () => {
  const subject = new Subject();
  const observableAtom = atomWithObservable(() => subject);

  const CounterValue = () => {
    const state = useAtomValue(observableAtom);
    return <>count: {state}</>;
  };

  const CounterButton = () => {
    const dispatch = useSetAtom(observableAtom);
    return <button onClick={() => dispatch(9)}>button</button>;
  };

  const { findByText, getByText } = render(
    <StrictMode>
      <Suspense fallback="loading">
        <CounterValue />
      </Suspense>
      <CounterButton />
    </StrictMode>
  );

  expect(await findByText("loading")).toBeTruthy();

  fireEvent.click(getByText("button"));
  expect(await findByText("count: 9")).toBeTruthy();

  act(() => subject.next(3));
  await findByText("count: 3");
});
