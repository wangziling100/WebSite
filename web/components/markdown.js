import markdownStyles from '../styles/markdown/github-markdown.module.css'
import cn from 'classnames'

export default function Markdown({ content }) {
  return (
      <>
      <div
        className={cn(markdownStyles['markdown-body'])}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      
      </>
  )
}
