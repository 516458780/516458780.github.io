import { ref, computed } from 'vue'
import Request from '/common/request.js'
import {showError} from "/common/util.js"

export const useLoadMore = (options = {}) => {
	let composableId = new Date().getTime()
	let lastRequestOptions = {}

	const isLoading = ref(false)
	const isLastPage = ref(false)
	const path = ref(options.path || '')
	const method = ref(options.method || 'POST')
	const pageSize = ref(options.pageSize || 20)
	const pageNum = ref(0)
	const uniqueKey = ref('id')
	const total = ref(0)
	const data = ref(null)
	const error = ref(null)
	const dealLisData = ref(options.dealLisData || ((data) => {
		return data
	}))
	const afterResponse = ref(options.afterResponse || ((data) => {
		return data
	}))

	const uniqueValues = computed(() => {
		if (!data.value || !uniqueKey.value) {
			return []
		}

		const result = []
		data.value.forEach((item) => {
			const val = item[uniqueKey.value]

			if (['', null, undefined].includes(val)) {
				return
			}

			if (result.includes(val)) {
				return
			}

			result.push(val)
		})

		return result
	})

	const setOptions = ref(options.setOptions || ((options) => {
		return options
	}))
	const testData = ref(options.testData || null)

	const reset = () => {
		composableId = new Date().getTime()
		isLoading.value = 0
		isLastPage.value = false
		pageNum.value = 0
		data.value = null
		error.value = null
	}

	const refresh = () => {
		if (!path.value) {
			return
		}

		if (isLoading.value) {
			return
		}

		if (!pageNum.value) {
			getNext()
			return
		}

		if (testData.value) {
			return
		}

		composableId = new Date().getTime()
		const requestComposableId = composableId

		const options = JSON.parse(JSON.stringify(lastRequestOptions))
		options.data.pageNum = 1
		options.data.pageSize = pageSize.value * pageNum.value

		isLoading.value = true
		Request(options)
			.then((res) => {
				if (res.data.code !== 0) {
					uni.showToast({
						icon: 'none',
						title: res.data.errMsg
					})
					return
				}
				if (requestComposableId !== composableId) {
					return
				}

				let oTotal = res.data?.data?.total
				if (typeof oTotal === 'number' && oTotal >= 0) {
					total.value = oTotal
				} else {
					total.value = 0
				}

				if (!data.value) {
					data.value = []
				}

				let list = dealLisData.value(res.data?.data?.list || [])
				data.value = list
				afterResponse.value(JSON.parse(JSON.stringify(list)))
			})
			.catch((err) => {
				console.error(err)
				error.value = err
			})
			.finally(() => {
				isLoading.value = false
			})
	}

	const getNext = () => {
		const requestComposableId = composableId

		if (!path.value) {
			return
		}

		if (isLoading.value) {
			return
		}

		console.log('lastPage===>', isLastPage.value)
		if (isLastPage.value) {
			return
		}

		if (testData.value) {
			isLoading.value = true
			setTimeout(() => {
				isLoading.value = false
				if (requestComposableId !== composableId) {
					return
				}
				pageNum.value++

				if (!data.value) {
					data.value = []
				}
				data.value.push(...(testData.value()))
				total.value = data.value.length
			}, 1000)
			return
		}

		const options = setOptions.value({
			path: path.value,
			method: method.value,
			header: {},
			data: {
				pageNum: pageNum.value + 1,
				pageSize: pageSize.value
			}
		})
		lastRequestOptions = JSON.parse(JSON.stringify(options))

		isLoading.value = true
		Request(options)
			.then((res) => {
				if (res.data.code !== 0) {
					throw new Error(res.data.errMsg)
				}
				if (requestComposableId !== composableId) {
					return
				}

				let oTotal = res.data?.data?.total
				if (typeof oTotal === 'number' && oTotal >= 0) {
					total.value = oTotal
				} else {
					total.value = 0
				}

				if (!data.value) {
					data.value = []
				}

				isLastPage.value = res.data?.data?.isLastPage || res.data?.data?.lastPage || false
				let list = dealLisData.value(res.data?.data?.list || [])

				if (list.length === 0 && pageNum.value > 0) {
					return
				}

				data.value.push(...list)
				pageNum.value++
				afterResponse.value(JSON.parse(JSON.stringify(list)))
			})
			.catch((err) => {
				console.error(err)
				error.value = err
				showError(err?.message)
			})
			.finally(() => {
				isLoading.value = false
			})
	}

	return {
		isLoading,
		path,
		method,
		pageSize,
		pageNum,
		total,
		data,
		error,
		reset,
		refresh,
		getNext,
		setOptions,
		testData,
		dealLisData,
		afterResponse
	}
}
