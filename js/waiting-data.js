import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'

export const useWaitingData = (options = {}) => {

	// options = {
	// 	key1: {
	// 		onBegin: () => {
	//
	// 		},
	// 		onEnd: () => {
	//
	// 		}
	// 	}
	// }

	const keys = {}

	const setKeys = (obj = {}) => {
		if (!obj) {
			return
		}

		for (let n in obj) {
			keys[n] = {
				...obj[n],
				waiting: false,
			}
		}
	}

	const beginWaiting = (key = '', data) => {
		if (!key) {
			return
		}

		if (keys[key]) {
			keys[key].waiting = true
			keys[key]?.onBegin?.(data)
		}
	}

	const endWaiting = (key = '', data) => {
		if (!key) {
			return
		}

		if (keys[key] && keys[key].waiting) {
			keys[key].waiting = false
			keys[key]?.onEnd?.(data)
		}
	}

	setKeys(options)

	onShow(() => {
		for (let n in keys) {
			endWaiting(n)
		}
	})

	return {
		keys,
		setKeys,
		beginWaiting,
		endWaiting
	}
}
