export default async function wait(time = 3000) {
  return await new Promise((res) => setTimeout(res, time))
}
