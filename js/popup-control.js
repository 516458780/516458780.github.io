import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { onReachBottom, onShow } from '@dcloudio/uni-app'

export const usePopupControl = (options = {}) => {
	const popupInfo = ref({
		if: false,
		show: false,
		name: ''
	})

	const keys = {
		// [name]: {
		// 	onShow: () => {
		// 		do something
		// 	},
		// 	onClose: () => {
		// 		do something
		// 	}
		// }
	}

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

	const openPopup = (name) => {
		if (!name) {
			return
		}

		if (popupInfo.value.name) {
			keys[popupInfo.value.name]?.onClose?.()
		}

		popupInfo.value.name = name
		popupInfo.value.if = true
		keys[name]?.onShow?.()
		nextTick(() => {
			popupInfo.value.show = true
		})
	}

	const closePopup = () => {
		if (popupInfo.value.name) {
			keys[popupInfo.value.name]?.onClose?.()
		}

		popupInfo.value.show = false
		setTimeout(() => {
			popupInfo.value.if = false
			popupInfo.value.name = ''
		}, 300)
	}

	setKeys(options)

	return {
		openPopup,
		closePopup
	}
}
