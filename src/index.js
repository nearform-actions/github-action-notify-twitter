import * as core from '@actions/core'

import { run } from './action.js'

run().catch(error => core.setFailed(error))
