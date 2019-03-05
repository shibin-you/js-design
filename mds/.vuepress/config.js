const resolve = d => require('path').resolve(__dirname, d)
module.exports = {
  title: 'javascript design',
  description: 'javascript design',
  base: '/js-design/',
  dest: resolve('../../docs'),
  head: [
    ['link', {
      rel: 'icon',
      href: `/logo.png`
    }]
  ],
  themeConfig: {
    nav: [],
    sidebar: {
      '/book': [{
          title: '第一章',
          collapsable: false,
          children: [
            'book/1/1.md',
            'book/1/2.md',
            'book/1/3.md',
          ]
        },

        {
          title: '第二章',
          collapsable: false,
          children: [
            'book/2/1.md',
            'book/2/2.md'
          ]
        },
        {
          title: '框架',
          collapsable: false,
          children: [
            'book/m/mvvm.md',
            'book/m/mvc.md',
            'book/m/vue.md'
          ]
        },
        {
          title: '正则表达式',
          collapsable: false,
          children: [
            'book/regx/regx.md',
          ]
        },
      ]
    }
  }
}
