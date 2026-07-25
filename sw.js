// バージョン名を更新して古いキャッシュを破棄させる
const CACHE_NAME = 'shopping-app-v2026-01';

// インストール時に即座に新しいサービスワーカーを有効化
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 有効化時に古いキャッシュをすべて削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// リクエスト時は常にネットワーク（最新）を優先し、失敗時のみキャッシュを使用
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});