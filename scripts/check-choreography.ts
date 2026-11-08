import assert from 'node:assert'
import { ACTS, stateFor } from '../src/lib/choreography'

assert.deepEqual(stateFor(0).cam, ACTS[0].cam, 'phase 0 = hero')
assert.equal(stateFor(ACTS.length - 1).stars, 1, 'last act = night')
assert.deepEqual(stateFor(-5).cam, ACTS[0].cam, 'clamps below')
assert.deepEqual(stateFor(99).cam, ACTS.at(-1)!.cam, 'clamps above')
const z = stateFor(0.5).cam[2]
assert.ok(z < ACTS[0].cam[2] && z > ACTS[1].cam[2], 'interpolates between acts')
console.log('choreography ok')
