const timeToByteArray = msTIme => {
  let array = []

  const handleTIme = time => {
    if (time < 256) array.unshift(time)
    else {
      let rest = time % 256
      array.unshift(rest)
      handleTIme(Math.floor(time / 256))
    }
  }

  handleTIme(msTIme)
  return Buffer.from(array)
}

module.exports = { timeToByteArray }
