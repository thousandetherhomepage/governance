run: deps
	pnpm run dev

build: deps
	pnpm run build

deps: node_modules

node_modules: ./pnpm-lock.yaml
	pnpm install
