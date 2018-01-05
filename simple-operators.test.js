import { marbles } from 'rxjs-marbles'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/reduce'

const increment = obs => obs.map(x => x + 1)

const onlySmallValues = obs => obs.filter(x => x <= 2)

const sum = (acc, curr) => acc + curr
const sumWithScan = obs => obs.scan(sum)
const sumWithReduce = obs => obs.reduce(sum)

test(
  'map allows us to transform all elements of an observable',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 2, b: 3, c: 4 })
    m.expect(increment(source)).toBeObservable(expected)
  }),
)

test(
  'we can filter out elements',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b--', { a: 1, b: 2 })
    m.expect(onlySmallValues(source)).toBeObservable(expected)
  }),
)

test(
  'we can chain operations',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a----', { a: 2 })
    m.expect(onlySmallValues(increment(source))).toBeObservable(expected)
  }),
)

test(
  'scan is an accumulator function, allowing us to sum over time',
  marbles(m => {
    const source = m.cold('a-b-c', { a: 1, b: 2, c: 3 })
    const expected = m.cold('a-b-c', { a: 1, b: 3, c: 6 })
    m.expect(sumWithScan(source)).toBeObservable(expected)
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
