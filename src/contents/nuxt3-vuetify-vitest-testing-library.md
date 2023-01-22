---
title: Nuxt3 × Vuetify3 × Vitest × Vue Testing Libraryで快適なテスト開発環境を作る
author: hsmon
datetime: 2023-01-21T00:00:00Z
featured: true
draft: false
tags:
  - nuxt
  - vuetify
  - vitest
  - vue-testing-library
description: Nuxt3 × Vuetify3 × Vitest × Vue Testing Libraryで快適なテスト開発環境の作り方の解説です。
setup: |
  import {OG} from "../components/OG.astro";
---

執筆時点で、Nuxt3がリリースされてから約2ヶ月程度が立ちました。

<!-- <OG url="https://nuxt.com/" /> -->

[https://nuxt.com/](https://nuxt.com/)

今回はタイトルの通り、以下の技術スタックで環境構築していきます。

- Nuxt3
- Vuetify3
- Vitest
- Vue Testing Library

## インストール

まずはNuxt3のインストールから始めます。

```bash
npx nuxi init nuxt3-app
```

続いて、Vuetify3のインストールを行います。

```bash
npm i -D vuetify@next vite-plugin-vuetify sass
```

その他、テストで利用するVitestやVue Testing Library関連もインストールしてしまいましょう！

```bash
npm install -D vitest @testing-library/vue happy-dom
```

## サンプルコンポーネントの作成

今回は、Vuetifyのコンポーネントを利用してテストを行うため、サンプルコンポーネントを作成します。

```vue
// components/Button.vue

<template>
  <v-app>
    <v-btn @click="onClick">
      {{ label }}
    </v-btn>
  </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    label: String,
  },
  name: 'Sample',
  setup() {
    const onClick = () => {
      console.log('clicked')
    }
    return { onClick }
  },
})
</script>
```

## nuxt.config.tsのセットアップ

`nuxt.config.ts`を作成し、以下のように記述します。

```ts
import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  css: ['vuetify/lib/styles/main.sass'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    }
  },
})
```

## Vitestのセットアップ

`vitest.config.ts`を作成し、以下のように記述します。  
VitestでVuetifyを利用するためには、`vite-plugin-vuetify`も必要になります。

```ts
// vitest.config.ts

/// <reference types="vitest" />
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from 'vite-plugin-vuetify';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins:
    [
      {
      name: 'vitest-plugin-beforeall',
      config: () => ({
        test: {
          setupFiles: [
            fileURLToPath(new URL('./vitest/beforeAll.ts', import.meta.url)),
          ],
        },
      }),
    },
      vue(),
      vuetify({
        autoImport: true,
        // styles: { configFile: './src/styles/variables.scss' },
      }),
    ]
  ,

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url)),
    },
  },

  test: {
    root: '.',
    globals: true,
    globalSetup: [fileURLToPath(new URL('./vitest/setup.ts', import.meta.url))],
    environment: "happy-dom",
    deps: {
      inline: ['vuetify'],
    },
  },
});
```

`plugins/vuetify.ts`も作成し、以下のように記述します。

```ts
// plugins/vuetify.ts

import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
  });

  nuxtApp.vueApp.use(vuetify);
});
```

続いて、`/vitest/beforeAll.ts`と`/vitest/setup.ts`を作成します。  
これがないと、`css.supports`でエラーが発生するためです。

```ts
// /vitest/beforeAll.ts

import { beforeAll } from 'vitest';
(global as any).CSS = { supports: () => false };

beforeAll(() => {
  global.CSS = {
    supports: (str: string) => false,
    escape: (str: string) => str,
  };
});
```

```ts
// /vitest/setup.ts

export async function setup() {
  global.CSS = {
    supports: (str: string) => false,
    escape: (str: string) => str,
  };
}
```

## テストコードの作成

テストコードを実装していきますが、Testing LibraryにVuetifyをマウントする必要があるため、まずは`renderWithVuetify`というカスタムラッパーの関数を用意します。

```ts
// renderWithVuetify.ts

import { render } from '@testing-library/vue'
import {createVuetify} from 'vuetify'

const vuetify = createVuetify({
  // vuetifyの設定を必要に応じて記述
})

const renderWithVuetify: typeof render = (component, options) => {
  const root = document.createElement('div')
  root.setAttribute('data-app', 'true')

  return render(
    component,
    {
      container: document.body.appendChild(root),
      global: {
        plugins: [vuetify],
      },
      ...options,
    },
  )
}

export default renderWithVuetify
```

重要になるのは`render`関数のオプションで用意している`global.plugins`キーで、ここにVuetifyを読み込ませる必要があります。

```txt
global: {
  plugins: [vuetify],
},
```

Vue2の場合、以下testing-libraryが用意していたコードサンプルを元に実装していましたが、Vue3の場合は上記のように`global.plugins`キーを利用する必要があります。  
自分が探す限り、どこにもそのようなサンプルコードがなかったので結構時間を取られてしまいました。。

[https://github.com/testing-library/vue-testing-library/blob/main/src/__tests__/vuetify.js](https://github.com/testing-library/vue-testing-library/blob/main/src/__tests__/vuetify.js)

そしてコンポーネントテスト用のファイルを作成します。

```ts
// components/Button.spec.ts

import { describe, it, expect } from 'vitest'
import { fireEvent } from '@testing-library/vue'
import customRender from '@/customRender'
import Button from './index.vue'

const props = {
  label: "Test Text"
}

describe('Button', () => {
  it('should render correctly', () => {
    const { getByRole } = customRender(Button, {
      props
    })

    expect(getByRole('button')).toBeTruthy()
  })

  it('should emit click event', () => {
    const { getByText } = customRender(Button, {
      props
    })

    fireEvent.click(getByText(props.label))
  })
})
```

## テストの実行

最後に、`package.json`にテストコマンドを追加します。

```json
{
  "scripts": {
    "test": "vitest"
  }
}
```

以下実行して、テストが通ることを確認します。

```bash
npm run test
```

```bash
 ✓ components/Button.spec.ts (2)

 Test Files  1 passed (1)
      Tests  2 passed (2)
   Start at  13:43:41
   Duration  3.21s (transform 1.76s, setup 62ms, collect 1.30s, tests 47ms)
```

無事テストが通りました！

今回作成した環境をリポジトリにアップしましたので、参考にしてみてください。

[https://github.com/hsmon/nuxt3-vuetify-vitest-testing-library](https://github.com/hsmon/nuxt3-vuetify-vitest-testing-library)

## 参考させていただいたリンク集

[https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html](https://codybontecou.com/how-to-use-vuetify-with-nuxt-3.html)  
[https://future-architect.github.io/articles/20210614b/](https://future-architect.github.io/articles/20210614b/)  
[https://github.com/logue/vite-vuetify-ts-starter](https://github.com/logue/vite-vuetify-ts-starter)  
[https://qiita.com/MS-0610/items/a16670713de929a5b9b1](https://qiita.com/MS-0610/items/a16670713de929a5b9b1)
