import { marbles } from 'rxjs-marbles'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/map'

const increment = obs => obs.map(x => x + 1)
const sum = obs => obs.scan((acc, curr) => acc + curr)

test(
  'map allows us to transform all elements of an observable',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 2, b: 3, c: 4 })
    m.expect(increment(source)).toBeObservable(expected)
  }),
)

test(
  'scan is an accumulator function, allowing us to sum over time for instance',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 1, b: 3, c: 6 })
    m.expect(sum(source)).toBeObservable(expected)
  }),
)

test(
  'we can chain rx operations',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 2, b: 5, c: 9 })
    m.expect(sum(increment(source))).toBeObservable(expected)
  }),
)
