# Non-cryptographic hash benchmark for JS/Node

This is an ad-hoc benchmark of various hashing functions for non-cryptographic
purposes. We test native and pure JS algorithms, different digest sizes, and
incremental and single-call hashing.

**Update (August 2021):** This benchmark predates
[WebAssembly](https://webassembly.org/). There likely exist hash functions
compiled into WebAssembly that beat the pure JS implementations. If somebody
wants to update this benchmark, a pull request would be most welcome!

Scroll down for recommendations.

## Libraries tested

* Native: Node's built-in [crypto](https://nodejs.org/api/crypto.html) MD5 algorithm
* Native: [xxhash](https://github.com/mscdex/node-xxhash)
* Native: [murmurhash-native](https://github.com/royaltm/node-murmurhash-native)
* Pure JS: [SparkMD5](https://github.com/satazor/js-spark-md5)
* Pure JS: [iMurmurHash](https://github.com/jensyt/imurmurhash-js)
* Pure JS: [murmurhash-js](https://github.com/garycourt/murmurhash-js), via [murmurhash](https://github.com/perezd/node-murmurhash) and [murmurhash-js](https://github.com/mikolalysenko/murmurhash-js) Node packages
* Pure JS: [murmur-hash](https://github.com/vnykmshr/murmur-hash)

I also tested but excluded [fnv-lite](https://github.com/casetext/fnv-lite)
and [fnv-plus](https://github.com/tjwebb/fnv-plus), because they were far too
slow.

## Results

```
create buf array: 686.968ms
create string array: 108.739ms

incremental:
64 xxhash (buffer): 95.854ms
128 crypto md5 (buffer): 88.443ms
128 spark-md5 (string): 206.730ms
128 murmurhash-native (buffer): 165.903ms
32 imurmurhash (string): 47.539ms
buffer concat: 178.362ms
string join: 29.137ms
string to buffer: 4.382ms

single:
64 xxhash (buffer): 0.875ms
128 crypto md5 (buffer): 9.623ms
128 spark-md5 (string): 80.058ms
128 murmurhash-native (buffer): 1.341ms
32 imurmurhash (string): 19.902ms
32 murmurhash (string): 30.000ms
32 murmurhash-js (string): 30.758ms
32 murmur-hash (string): 38.936ms
128 murmur-hash (string): 378.017ms
```

## Discussion and Recommendations

* If you need a pure JS implementation:

    * If you only need 32 bit digests, use [iMurmurHash](https://github.com/jensyt/imurmurhash-js). Note that this will give you collisions after about 2**14 (16,000) hashes.

    * Use [SparkMD5](https://github.com/satazor/js-spark-md5) if you need more than 32 bits. I didn't find a fast 64 or 128 bit Murmur implementation, but SparkMD5 was surprisingly fast (75 MB/sec).

        * If you need incremental updates, consider joining strings into larger chunks before feeding them to SparkMD5, as SparkMD5's incremental hashing seems to suffer from some moderate overhead.

* If you are on Node:

    * If you are hashing Buffers: Use the built-in [crypto](https://nodejs.org/api/crypto.html) module with the MD5 algorithm.

        * The exception to this is: If you don't need incremental hashing, *and* you need more than 500 MB/sec throughput, *and* you're OK with a native npm dependency, use [murmurhash-native](https://github.com/royaltm/node-murmurhash-native) for some extra performance. I didn't test digest sizes of less than 128 bit, as even with 128 bits the hashing is so fast that it's not likely to be a bottleneck.

            (Note that murmurhash-native technically supports incremental hashing, but it's slower than Node's built-in MD5 algorithm in this mode.)

    * If you are hashing a single string non-incrementally, convert
      it to a Buffer and see the preceding bullet point.

    * If you are hashing strings incrementally:

        * If you only need 32 bits, use iMurmurHash. Note that this will give you collisions after about 2**14 (16,000) hashes.

        * If you need more than 32 bits: Use the built-in crypto module with the MD5 algorithm.

            * I also recommend that you experiment with joining strings together into larger chunks, since strings are implicitly converted to Buffers when you pass them to the crypto module, and each Buffer creation is quite slow. Performance will generally be bottlenecked by Buffer creation and string joining, as the native hashing function is very fast in comparison.
