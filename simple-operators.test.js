import { marbles } from 'rxjs-marbles'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/reduce'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'

const sum = (acc, curr) => acc + curr
const increment = obs => obs.map(x => x + 1)
const sumWithScan = obs => obs.scan(sum)
const sumWithReduce = obs => obs.reduce(sum)
const onlySmallValues = obs => obs.filter(x => x <= 2)

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
    m.expect(sumWithScan(source)).toBeObservable(expected)
  }),
)

test(
  'we can chain rx operations',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 2, b: 5, c: 9 })
    m.expect(sumWithScan(increment(source))).toBeObservable(expected)
  }),
)

test(
  'we can filter out rx elements',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b--', { a: 1, b: 2 })
    m.expect(onlySmallValues(source)).toBeObservable(expected)
  }),
)

test(
  'the difference between scan and reduce: we use scan if we want intermediate values, reduce if we only want the final',
  marbles(m => {
    const source = m.cold('a-b-c-|', { a: 1, b: 2, c: 3 })
    const expected = m.cold('------(a|)', { a: 6 })
    m.expect(sumWithReduce(source)).toBeObservable(expected)
  }),
)
