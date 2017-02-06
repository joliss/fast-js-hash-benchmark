# Non-cryptographic hash benchmark for JS/Node

This is an ad-hoc benchmark of various hashing functions for non-cryptographic
purposes. We test native and pure JS algorithms, different digest sizes, and
incremental and single-call hashing.

Scroll down for recommendations.

## Libraries tested

* Native: Node's built-in [crypto](https://nodejs.org/api/crypto.html) MD5 algorithm
* Native: [xxhash](https://github.com/mscdex/node-xxhash)
* Native: [murmurhash-native](https://github.com/royaltm/node-murmurhash-native)
* Pure JS: [js-spark-md5](https://github.com/satazor/js-spark-md5)
* Pure JS: [imurmurhash](https://github.com/jensyt/imurmurhash-js)

I also tested but excluded [fnv-lite](https://github.com/casetext/fnv-lite)
and [fnv-plus](https://github.com/tjwebb/fnv-plus), because they were far too
slow.

## Results

```
create buf array: 744.725ms
create string array: 102.209ms

incremental:
64 xxhash (buffer): 100.239ms
128 crypto md5 (buffer): 89.052ms
128 spark-md5 (string): 198.852ms
128 murmurhash-native (buffer): 157.417ms
32 imurmurhash (string): 37.462ms
buffer concat: 195.622ms
string join: 33.085ms
string to buffer: 4.443ms

single:
64 xxhash (buffer): 0.643ms
128 crypto md5 (buffer): 9.343ms
128 spark-md5 (string): 78.169ms
128 murmurhash-native (buffer): 1.349ms
32 imurmurhash (string): 22.774ms
```

## Discussion and Recommendations

* If you need a pure JS implementation:

    * If you only need 32 bits, use imurmurhash. Note that this will give you collisions after about 2**14 (16,000) hashes.

    * Use spark-md5 if you need more than 32 bits. I didn't find a fast 64 or 128 bit murmur implementation, but spark-md5 was surprisingly fast (75 MB/sec).

        * If you need incremental updates, consider joining strings into larger chunks before feeding them to spark-md5, as spark-md5's incremental hashing seems to suffer from some moderate overhead.

* If you are on Node:

    * If you are hashing Buffers: Use the built-in crypto module with the MD5 algorithm.

        * The exception to this is: If you don't need incremental hashing, *and* you need more than 500 MB/sec throughput, *and* you're OK with a native npm dependency, use murmurhash-native for some extra performance. I didn't test digest sizes of less than 128 bit, as even with 128 bits the hashing is so fast that it's not likely to be a bottleneck.

            (Note that murmurhash-native technically supports incremental hashing, but it's slower than Node's built-in MD5 algorithm in this mode.)

    * If you are hashing a single string non-incrementally, convert
      it to a Buffer and see the preceding bullet point.

    * If you are hashing strings incrementally:

        * If you only need 32 bits, use imurmurhash. Note that this will give you collisions after about 2**14 (16,000) hashes.

        * If you need more than 32 bits: Use the built-in crypto module with the MD5 algorithm.

            * I also recommend that you experiment with joining strings together into larger chunks, since strings are implicitly converted to Buffers when you pass them to the crypto module, and each Buffer creation is quite slow. Performance will generally be bottlenecked by Buffer creation and string joining, as the native hashing function is quite fast.
