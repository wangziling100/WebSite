import markdownStyles from '../styles/markdown/github-markdown.module.css'

export default function Markdown({ content }) {
  return (
      <div
        className={markdownStyles['markdown-body']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
  )
}
