import { Group, Loader, Select, Stack } from '@mantine/core';
import Head from 'next/head';
import { useEffect, useMemo } from 'react';
import { trpc } from '~/utils/trpc';
import { GetAllModelsReturnType } from '~/server/services/models/getAllModels';
import { useInView } from 'react-intersection-observer';
import { MasonryList } from '~/components/MasonryList/MasonryList';
import { MetricTimeframe } from '@prisma/client';
import { useModelStore } from '~/hooks/useModelStore';
import { ModelSort } from '~/server/common/enums';

function Home() {
  const { ref, inView } = useInView();

  const filters = useModelStore((state) => state.filters);
  const setSort = useModelStore((state) => state.setSort);
  const setPeriod = useModelStore((state) => state.setPeriod);

  const {
    data,
    isLoading,
    // isFetching,
    fetchNextPage,
    // fetchPreviousPage,
    hasNextPage,
    // hasPreviousPage,
  } = trpc.model.getAll.useInfiniteQuery(
    { limit: 100, ...filters },
    {
      getNextPageParam: (lastPage: any) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage: any) => firstPage.prevCursor,
    }
  );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [inView]); //eslint-disable-line

  const models = useMemo(
    (): GetAllModelsReturnType['items'] => data?.pages.flatMap((x) => x.items) ?? [],
    [data]
  );

  const sortOptions = Object.values(ModelSort);
  const periodOptions = Object.values(MetricTimeframe);

  return (
    <>
      <Head>
        <meta name="description" content="Community driven AI model sharing tool" />
      </Head>
      <Stack>
        <Group position="apart">
          <Select
            data={sortOptions}
            value={filters.sort}
            onChange={(value: ModelSort) => setSort(value)}
          />
          <Select
            data={periodOptions}
            value={filters.period}
            onChange={(value: MetricTimeframe) => setPeriod(value)}
          />
        </Group>
        <MasonryList columnWidth={300} data={models} />
        {!isLoading && (
          <Group position="center" ref={ref}>
            {hasNextPage && <Loader />}
          </Group>
        )}
      </Stack>
    </>
  );
}

// Home.getLayout = (page: React.ReactElement) => <>{page}</>;
export default Home;
