---
title: Vercel × Google Domainsで独自ドメインを設定する方法
author: hsmon
datetime: 2022-12-03T18:01:51Z
featured: true
draft: false
tags:
  - vercel
  - google-domains
description: "VercelのサイトにGoogle Domainsを設定する方法"
setup: |
  import { Image } from '@astrojs/image/components'
---

このサイトはVercelでホスティングしており、Google Domainsで購入したドメインを設定したので備忘録として残しておきます。

## Google Domainsでドメインの購入

まずは[Google Domains](https://domains.google/)でドメインを購入します。（購入方法は割愛します。）

ドメインを購入したら、Vercelのプロジェクトの設定からドメインを設定します。

## Vercelでドメインの設定

購入したドメインをVercelのプロジェクトに設定します。

1. Vercelのコンソール画面上にて目的のプロジェクトを選択します。
2. `Settings`→`Domains`の順で選択し、以下の入力欄からGoogle Domainsで購入したドメイン名を入力して Add ボタンを押下します。

<Image src='/assets/images/vercel-google-domains/1.png' />

3. 押下後、以下画面が表示されるので、任意の箇所を選択します。（特別な理由がない限り`Recommended`を選択すると良いでしょう）今回は`Recommended`を選択します。

<Image src='/assets/images/vercel-google-domains/2.png' />

4. 追加後、以下一覧画面に追加したドメインが表示されます。（通常のドメインとwwwのサブドメインが追加されます）  
また、Aレコードとして`76.76.21.21`、www側ではCNAMEとして`cname.vercel-dns.com.`が表示されていますが、Google Domains側でDNSレコードの設定を行いますのでメモなど残しておきましょう。  
問題なく設定が完了したら`Invalid Configuration`が`Valid Configuration`に変化します。

<Image src='/assets/images/vercel-google-domains/3.png' />

5. Google Domainsのコンソール画面上にて目的のドメインを選択し、「DNS」を選択します。

<Image src='/assets/images/vercel-google-domains/4.png' />

6. 今回は、AレコードとCNAMEレコードを設定します。  
Aレコードには、  
「ホスト名」欄は空のまま、  
「タイプ」欄は`A`、  
「データ」欄にはVercelのプロジェクトの設定画面でメモした`76.76.21.21`を設定します。

<Image src='/assets/images/vercel-google-domains/5.png' />

7. 保存を押下すると、以下のように設定が反映されます。  

<Image src='/assets/images/vercel-google-domains/6.png' />

8. Vercel側の画面に戻ると、以下のように`Valid Configuration`に変化していることが確認できます。  
また同時に、SSL証明書の設定も行ってくれます！  
これに続いてCNAMEレコードの設定も行いましょう。  
Google Domains側に戻り、新しく`カスタム レコードを管理`→`新しいレコードを作成`を押下します。

<Image src='/assets/images/vercel-google-domains/7.png' />

9. CNAMEレコードには、  
「ホスト名」欄は`www`、  
「タイプ」欄は`CNAME`、  
「データ」欄にはVercelのプロジェクトの設定画面でメモした`cname.vercel-dns.com.`を設定します。

<Image src='/assets/images/vercel-google-domains/8.png' />

10. 問題がなければ、以下のように設定が反映されます。  
以上で、Google DomainsとVercelの設定は完了です！お疲れさまでした！

<Image src='/assets/images/vercel-google-domains/9.png' />