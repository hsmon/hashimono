---
title: ホワイトリストを活用したAWS Lambda上でのCORSやCSRFの対策
author: hsmon
datetime: 2022-12-11T15:48:51Z
featured: false
draft: false
tags:
  - aws
  - lambda
  - serverside
  - python
  - api
description: ホワイトリストを活用したAWS Lambdaの対策方法について
setup: |
  import { Image } from '@astrojs/image/components'
---

API GatewayとLambdaを実装した際に、とある事情でAWS Lambda上でCORSの対応を行う必要がありました。  
Lambdaではレスポンスヘッダに`Access-Control-Allow-Origin`の指定が複数できないらしく、そのまま複数のoriginを指定することができません。  
そのため、Lambda上でホワイトリストを作成し、問い合わせが来たoriginとホワイトリストを比較し、マッチしていれば目的のレスポンスを返すようにします。

## ホワイトリストの作成

まずは、ホワイトリストを作成します。
Lambdaの環境変数にホワイトリストを設定しましょう。  
変数名は任意ですが、今回は`WHITELIST`とします。  
値は、カンマ区切りで複数指定します。

```text
https://example.com,https://example2.com
```

## Lambdaの実装

ホワイトリストを作成したら、Lambdaの実装を行います。  
今回は、Pythonで実装します。  
Pythonの場合、ホワイトリストを環境変数から取得するには、`os.environ`を使用します。  
`lambda_handler`は後ほど実装します。

```python
import os

def lambda_handler(event, context):
  // 省略

def is_white_origin(target_origin):
    if not target_origin:
        return False
    origin_whitelist = os.environ["ORIGIN_WHITELIST"].split(",")
    return any(white_origin in target_origin for white_origin in origin_whitelist)
```

### レスポンスヘッダの設定

次に、`lambda_handler`にレスポンスヘッダを設定します。
ホワイトリストにマッチしていれば、レスポンスヘッダに`Access-Control-Allow-Origin`を設定します。

```python
def lambda_handler(event, context):
    // originの取得
    origin = event["headers"]["origin"]
    // ホワイトリストにマッチしていれば、目的のレスポンスを返す
    if is_white_origin(origin):
        response = {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Credentials": True,
                "Access-Control-Allow-Headers": "Content-Type Authorization Origin X-Requested-With",
                // その他,必要に応じてヘッダを追加
            },
            "body": json.dumps({"message": "response_message"}),
        }
    else: // ホワイトリストにマッチしていなければ、403を返す
        response = {
            "statusCode": 403,
            "body": json.dumps({"message": "Forbidden"}),
        }
    return response
```

こちらで実際にレスポンスヘッダに`Access-Control-Allow-Origin`が設定されていることを確認しましょう。
問題がなければ、これで完了となります。

## API Gatewayの設定

最後に、API Gatewayの設定を行います。  
API Gatewayのリソースに`OPTIONS`メソッドを追加し、Lambdaのエンドポイントを指定しましょう。

参考記事  
[https://www.tdi.co.jp/miso/aws-whitelist-api](https://www.tdi.co.jp/miso/aws-whitelist-api)
