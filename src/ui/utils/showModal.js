import bootstrap from 'bootstrap'

export const showModal = (selector, templateInstance) => {
    const element = templateInstance
        ? templateInstance.$(id)
        : document.querySelector(selector)
    const modal = new bootstrap.Modal(element)
    modal.show()
    return modal
}