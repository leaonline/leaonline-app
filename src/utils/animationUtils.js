export const fadeOut = (target, templateInstance, cb) => {
  setTimeout(() => {
    let $target
    try {
      $target = templateInstance.$(target)
    }
    catch (e) {
      console.error(e) // TODO LOG MISSING DOM RANGE ERROR
      $target = global.$(target)
    }
    finally {
      if ($target && $target.fadeOut) {
        $target.fadeOut('slow', cb)
      }
      else {
        console.info('skip missing target', target)
        cb()
      }
    }
  }, 0)
}

export const fadeIn = (target, templateInstance, cb) => {
  let $target
  try {
    $target = templateInstance.$(target)
  }
  catch (e) {
    console.error(e) // TODO LOG MISSING DOM RANGE ERROR
    $target = global.$(target)
  }
  finally {
    if ($target && $target.fadeIn) {
      $target.fadeIn('slow', () => {
        cb(null, $target)
      })
    }
    else {
      cb(new Error(`Undefined target [${target}]`))
    }
  }
}
