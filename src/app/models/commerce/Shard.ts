export type ShardType =
	'a' | 'b' | 'c' | 'd' | 'e' |
	'f' | 'g' | 'h' | 'i' | 'j' |
	'k' | 'l' | 'm' | 'n' | 'o' |
	'p' | 'q' | 'r' | 's' | 't' |
	'u' | 'v' | 'w' | 'x' | 'y' |
	'z'

export type ShardChank = ShardType[]

export const ShardCharacters: ShardType[] = [
	'a', 'b', 'c', 'd', 'e',
	'f', 'g', 'h', 'i', 'j',
	'k', 'l', 'm', 'n', 'o',
	'p', 'q', 'r', 's', 't',
	'u', 'v', 'w', 'x', 'y',
	'z'
]

export const DafaultShardCharacters: ShardType[] = ShardCharacters.slice(0, 10)

export const randomShard = (seed: ShardType[]): ShardType => {
	return seed[Math.floor(Math.random() * Math.floor(seed.length))]
}

const MAX_IN_VALUES = 10

export const shardChunks = (shards: ShardType[]): ShardChank[] => {
	const chunks: ShardChank[] = []
	let start = 0
	while (start < shards.length) {
		const elements = Math.min(MAX_IN_VALUES, shards.length - start)
		const end = start + elements
		chunks.push(shards.slice(start, end))
		start = end
	}
	return chunks
}
