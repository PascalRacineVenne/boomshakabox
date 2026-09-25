import { css } from "@linaria/core";
import classNames from "classnames";
import { Flex } from "antd";

const styles = {
  dot: css`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    cursor: pointer;
  `,
  dotViewed: css`
    background: var(--contrast-1);
  `,
};

interface PageDotsProps {
  pageCount: number;
  viewedPage: number;
  onSelectPage: (page: number) => void;
}

const PageDots = ({ pageCount, viewedPage, onSelectPage }: PageDotsProps) => (
  <Flex gap={4} align="center">
    {Array.from({ length: pageCount }, (_, page) => (
      <div
        key={page}
        className={classNames(
          styles.dot,
          page === viewedPage && styles.dotViewed,
        )}
        onClick={() => onSelectPage(page)}
      />
    ))}
  </Flex>
);

export default PageDots;
