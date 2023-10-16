import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

export const Home = ({ list }: { list: string[] }) => {
  return (
    <div>
      {list.map((item) => (
        <div key={item}>
          <a href={`/watch${item}`}>{item}</a>
        </div>
      ))}
    </div>
  );
};

export const ui = (list: string[]) =>
  renderToStaticMarkup(<Home list={list} />);
