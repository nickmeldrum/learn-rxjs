import { marbles } from 'rxjs-marbles'

import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/scan'
import 'rxjs/add/operator/reduce'

import 'rxjs/add/operator/concat'
import 'rxjs/add/operator/merge'

import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/concatMap'
import 'rxjs/add/operator/switchMap'

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

test(
  'concat means the next subscription will not start until the previous one completes',
  marbles(m => {
    const source1 = m.cold('a-b-c-|')
    const source2 = m.cold('d-e-f')
    const expected = m.cold('a-b-c-d-e-f')

    m.expect(source1.concat(source2)).toBeObservable(expected)

    const source1NotCompleted = m.cold('a-b-c')
    const expectedNotCompleted = m.cold('a-b-c')
    m.expect(source1NotCompleted.concat(source2)).toBeObservable(expectedNotCompleted)
  }),
)

test(
  'merge turns multiple observables into a single one',
  marbles(m => {
    const source1 = m.cold('a-b-c')
    const source2 = m.cold('-d-e-')
    const expected = m.cold('adbec')

    m.expect(source1.merge(source2)).toBeObservable(expected)
  }),
)

test(
  'mergeMap flattens an observable of observables',
  marbles(m => {
    const inner1 = m.cold('ab')
    const inner2 = m.cold('cd')
    const inner3 = m.cold('ef')

    const source = m.cold('a-b-c', { a: inner1, b: inner2, c: inner3 })
    const expected = m.cold('abcdef')

    m.expect(source.mergeMap(x => x)).toBeObservable(expected)
  }),
)

test(
  'concatMap flattens an observable of observables waiting for the inner observables to end',
  marbles(m => {
    const inner1 = m.cold('ab')
    const inner2 = m.cold('cd')

    const source = m.cold('a-b', { a: inner1, b: inner2 })
    const expected = m.cold('ab')

    m.expect(source.concatMap(x => x)).toBeObservable(expected)

    const inner1Completed = m.cold('ab|')
    const sourceWithCompletedInner = m.cold('a-b', { a: inner1Completed, b: inner2 })
    const expectedCompleted = m.cold('abcd')

    m.expect(sourceWithCompletedInner.concatMap(x => x)).toBeObservable(expectedCompleted)
  }),
)

test(
  'to make clear the difference between concatMap and mergeMap',
  marbles(m => {
    const inner1 = m.cold('-a-b--')
    const inner1Completed = m.cold('-a-b-|')

    const inner2 = m.cold('-----c-d-|')

    const source = m.cold('a-b', { a: inner1, b: inner2 })
    const sourceWithFirstInnerCompleted = m.cold('a-b', { a: inner1Completed, b: inner2 })

    // mergemap will not wait for a completion and just takes items as they are emitted:
    m.expect(source.mergeMap(x => x)).toBeObservable(m.cold('-a-b---c-d'))

    // whereas concatMap will wait for a completion
    m.expect(source.concatMap(x => x)).toBeObservable(m.cold('-a-b'))
    // and concatMap is preserving order here
    m.expect(sourceWithFirstInnerCompleted.concatMap(x => x)).toBeObservable(m.cold('-a-b------c-d'))
  }),
)

test(
  'switchMap always just switches to the most recent observable',
  marbles(m => {
    const inner1 = m.cold('-1-2-')
    const inner2 = m.cold('-3-4-')

    const source = m.cold('a-b', { a: inner1, b: inner2 })

    m.expect(source.switchMap(x => x)).toBeObservable(m.cold('-1-3-4'))
  }),
)
