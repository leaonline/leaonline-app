import { useEffect, useState } from 'react'

const lorem = `Et est ut maiores ea qui laborum nulla ullam. Animi voluptatem ipsa est labore illo. Placeat laudantium assumenda reprehenderit repudiandae et.

Hic nihil voluptatum dolorem eligendi qui ipsam et. Blanditiis labore iste qui voluptates qui ut molestias eveniet. Corporis et enim sed sapiente. Aut corporis repudiandae cumque et cupiditate. Qui quis eum natus.

Quia culpa laborum doloremque veritatis maxime. Culpa facere voluptates magni at aperiam omnis dolorem. Cum molestiae dolore qui quas atque recusandae ratione id. Error animi vel id. Exercitationem alias et molestiae.

Vitae voluptates ut consequatur dolorem culpa optio magni. Deleniti nam esse ullam similique hic. Aut temporibus odio quae.

Suscipit mollitia voluptates ullam beatae non. Qui beatae aut maiores. Ducimus in deleniti incidunt laborum aliquid asperiores. Ut consectetur enim quis et. Est quo vero quia sunt cum aut assumenda iste. Est eius cumque dolorum in.`

export const useLegal = () => {
  // TODO fetch legal docs from backend or use linked ones from .env
  const [termsAndConditions, setTermsAndConditions] = useState([])

  useEffect(() => {
    setTermsAndConditions(lorem.split(/\n+/g))
  }, [])

  return { termsAndConditions }
}