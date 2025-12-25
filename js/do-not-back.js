const initBackPrevent = () => {
    history.pushState(null, null, window.location.href)
    // 监听popstate事件（后退/前进触发）
    window.onpopstate = () => {
        history.go(1)

        setTimeout(() => {
            Dialog.confirm({
                title: '提示',
                message: '确认要后退吗？',
                showCancelButton: true,
                confirmButtonText: '我要后退',
                cancelButtonText: '取消',
            })
                .then(() => {
                    window.onpopstate = null
                    history.go(-2)
                })
                .catch(() => {
                });
        }, 300)
    }
}