var crypto = require('crypto')
var XXHash = require('xxhash');
var murmurhashNative = require('murmurhash-native')
var murmurhashNativeStream = require('murmurhash-native/stream');
var ImurmurHash3 = require('imurmurhash');
var murmurhash = require('murmurhash')
var murmurhashJs = require('murmurhash-js')
var murmurHash3 = require('murmur-hash').v3
var FNV = require('fnv-lite');
var fnv = require('fnv-plus');
var SparkMD5 = require('spark-md5')

var hasher

console.time('create buf array')
var arr = []
for (var i = 0; i < 1000000; i++) {
  arr.push(new Buffer(i.toString()))
}
console.timeEnd('create buf array')

console.time('create string array')
var sarr = []
for (var i = 0; i < arr.length; i++) {
  sarr.push(i.toString())
}
console.timeEnd('create string array')

console.error()
console.error('incremental:')

console.time('64 xxhash (buffer)')
hasher = new XXHash.XXHash64(0)
for (i = 0; i < arr.length; i++) {
  hasher.update(arr[i])
}
hasher.digest()
console.timeEnd('64 xxhash (buffer)')

console.time('128 crypto md5 (buffer)')
hasher = crypto.createHash('md5')
for (i = 0; i < arr.length; i++) {
  hasher.update(arr[i])
}
hasher.digest('hex')
console.timeEnd('128 crypto md5 (buffer)')

console.time('128 spark-md5 (string)')
hasher = new SparkMD5
for (i = 0; i < sarr.length; i++) {
  hasher.append(sarr[i])
}
hasher.end()
console.timeEnd('128 spark-md5 (string)')

console.time('128 murmurhash-native (buffer)')
hasher = murmurhashNativeStream.createHash('murmurHash128');
for (i = 0; i < arr.length; i++) {
  hasher.update(arr[i])
}
hasher.digest('hex')
console.timeEnd('128 murmurhash-native (buffer)')

console.time('32 imurmurhash (string)')
hasher = ImurmurHash3();
for (i = 0; i < sarr.length; i++) {
  hasher.hash(sarr[i])
}
hasher.result()
console.timeEnd('32 imurmurhash (string)')

console.time('buffer concat')
var joined = Buffer.concat(arr)
console.timeEnd('buffer concat')

console.time('string join')
var sjoined = sarr.join('')
console.timeEnd('string join')

console.time('string to buffer')
new Buffer(sjoined)
console.timeEnd('string to buffer')

console.error()
console.error('single:')

console.time('64 xxhash (buffer)')
hasher = new XXHash.XXHash64(0)
hasher.update(joined)
hasher.digest()
console.timeEnd('64 xxhash (buffer)')

console.time('128 crypto md5 (buffer)')
hasher = crypto.createHash('md5')
hasher.update(joined)
hasher.digest('hex')
console.timeEnd('128 crypto md5 (buffer)')

console.time('128 spark-md5 (string)')
SparkMD5.hash(sjoined)
console.timeEnd('128 spark-md5 (string)')

console.time('128 murmurhash-native (buffer)')
murmurhashNative.murmurHash128(joined)
console.timeEnd('128 murmurhash-native (buffer)')

console.time('32 imurmurhash (string)')
hasher = ImurmurHash3()
hasher.hash(sjoined)
hasher.result()
console.timeEnd('32 imurmurhash (string)')

console.time('32 murmurhash (string)')
murmurhash.v3(sjoined)
console.timeEnd('32 murmurhash (string)')

console.time('32 murmurhash-js (string)')
murmurhashJs.murmur3(sjoined)
console.timeEnd('32 murmurhash-js (string)')

console.time('32 murmur-hash (string)')
murmurHash3.x86.hash32(sjoined)
console.timeEnd('32 murmur-hash (string)')

console.time('128 murmur-hash (string)')
// .x86 produces the wrong result on my platform
murmurHash3.x64.hash128(sjoined)
console.timeEnd('128 murmur-hash (string)')
