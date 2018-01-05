import { marbles } from 'rxjs-marbles'
import 'rxjs/add/operator/scan'

const sum = obs => obs.scan((acc, curr) => acc + curr)

test('scan is an accumulator function, allowing us to sum over time for instance', marbles(m => {
  const source = m.hot('a-b-c', { a: 1, b: 2, c: 3 })
  const expected = m.cold('a-b-c', { a: 1, b: 3, c: 6 })

  m.expect(sum(source)).toBeObservable(expected)
}))
